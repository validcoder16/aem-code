function createRegionDropdown() {
  const wrapper = document.createElement('div');
  wrapper.className = 'countries-filter';

  const label = document.createElement('label');
  label.setAttribute('for', 'countries-region');
  label.textContent = 'Select Region';

  const select = document.createElement('select');
  select.id = 'countries-region';
  select.className = 'countries-region';

  const regions = [
    ['all', 'All Countries'],
    ['asia', 'Asia'],
    ['america', 'America'],
    ['europe', 'Europe'],
    ['oceania', 'Oceania'],
  ];

  regions.forEach(([value, text]) => {
    const option = document.createElement('option');

    option.value = value;
    option.textContent = text;

    select.append(option);
  });

  wrapper.append(label);
  wrapper.append(select);

  return {
    wrapper,
    select,
  };
}


/*
 * CREATE TABLE
 */
function createTable(data) {
  const wrapper = document.createElement('div');

  wrapper.className = 'countries-table-wrapper';

  const table = document.createElement('table');

  table.className = 'countries-table';


  /*
   * HEADER
   */
  const thead = document.createElement('thead');

  const headerRow = document.createElement('tr');

  const headers = [
    'S.No',
    'Countries',
    'Code',
    'Capital',
    'Region',
    'Population',
    'Currency',
  ];

  headers.forEach((headerText) => {
    const th = document.createElement('th');

    th.textContent = headerText;

    headerRow.append(th);
  });

  thead.append(headerRow);

  table.append(thead);


  /*
   * BODY
   */
  const tbody = document.createElement('tbody');

  if (!data.length) {
    const row = document.createElement('tr');

    const cell = document.createElement('td');

    cell.colSpan = 7;

    cell.textContent = 'No countries found.';

    row.append(cell);

    tbody.append(row);
  } else {
    data.forEach((country, index) => {
      const row = document.createElement('tr');

      const values = [
        index + 1,
        country.Countries,
        country.Code,
        country.Capital,
        country.Region,
        country.Population,
        country.Currency,
      ];

      values.forEach((value) => {
        const td = document.createElement('td');

        td.textContent = value ?? '';

        row.append(td);
      });

      tbody.append(row);
    });
  }

  table.append(tbody);

  wrapper.append(table);

  return wrapper;
}


/*
 * FETCH MULTI-SHEET JSON
 */
async function fetchCountries(jsonURL, sheet = 'all') {
  const { pathname } = new URL(jsonURL);

  /*
   * Always use current AEM/local origin.
   *
   * Example:
   *
   * https://main--aem-code--validcoder16.aem.page/countries.json
   *
   * becomes:
   *
   * /countries.json
   */
  const url = pathname;

  console.log('Fetching JSON:', url);

  const response = await fetch(url);

  console.log(
    'Response status:',
    response.status
  );

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}`
    );
  }

  const json = await response.json();

  console.log(
    'Countries JSON:',
    json
  );


  /*
   * MULTI-SHEET JSON
   *
   * {
   *   data: {...},
   *   asia: {...},
   *   america: {...},
   *   europe: {...},
   *   oceania: {...}
   * }
   */


  let sheetData;


  /*
   * ALL COUNTRIES
   */
  if (sheet === 'all') {
    sheetData = json.data;
  } else {
    sheetData = json[sheet];
  }


  console.log(
    'Selected sheet object:',
    sheetData
  );


  if (!sheetData) {
    throw new Error(
      `Sheet "${sheet}" not found`
    );
  }


  /*
   * The sheet may itself contain a data array.
   *
   * Example:
   *
   * asia: {
   *   data: [...]
   * }
   */
  if (
    sheetData.data &&
    Array.isArray(sheetData.data)
  ) {
    return sheetData.data;
  }


  /*
   * Sometimes sheet may directly be an array.
   */
  if (Array.isArray(sheetData)) {
    return sheetData;
  }


  /*
   * If sheet object contains another
   * structure, try to find the first array.
   */
  if (
    typeof sheetData === 'object'
  ) {
    const arrayKey =
      Object.keys(sheetData).find(
        (key) =>
          Array.isArray(sheetData[key])
      );

    if (arrayKey) {
      return sheetData[arrayKey];
    }
  }


  console.error(
    'Unable to find array in sheet:',
    sheetData
  );

  throw new Error(
    `No data array found in sheet "${sheet}"`
  );
}


/*
 * DECORATE
 */
export default async function decorate(block) {

  console.log(
    '=============================='
  );

  console.log(
    'COUNTRIES BLOCK START'
  );

  console.log(
    '=============================='
  );


  /*
   * Get authored JSON URL
   */
  const urlElement =
    block.querySelector('p');


  if (!urlElement) {
    console.error(
      'Countries JSON URL not found'
    );

    return;
  }


  const jsonURL =
    urlElement.textContent.trim();


  console.log(
    'Authored JSON URL:',
    jsonURL
  );


  if (!jsonURL) {
    console.error(
      'Countries JSON URL is empty'
    );

    return;
  }


  /*
   * Loading
   */
  block.innerHTML = '';


  const loading =
    document.createElement('div');

  loading.className =
    'countries-loading';

  loading.textContent =
    'Loading countries...';

  block.append(loading);


  /*
   * Load initial data
   */
  let countries;


  try {
    countries =
      await fetchCountries(
        jsonURL,
        'all'
      );

  } catch (error) {

    console.error(
      'Countries fetch error:',
      error
    );

    loading.textContent =
      'Unable to load countries data.';

    loading.classList.add(
      'countries-error'
    );

    return;
  }


  console.log(
    'Countries loaded:',
    countries.length
  );


  /*
   * Main container
   */
  const container =
    document.createElement('div');

  container.className =
    'countries-container';


  /*
   * Dropdown
   */
  const {
    wrapper: dropdownWrapper,
    select,
  } =
    createRegionDropdown();


  container.append(
    dropdownWrapper
  );


  /*
   * Initial table
   */
  let table =
    createTable(countries);

  container.append(table);


  /*
   * Replace loading
   */
  loading.replaceWith(
    container
  );


  /*
   * CHANGE SHEET
   */
  select.addEventListener(
    'change',
    async () => {

      const selectedSheet =
        select.value;


      console.log(
        'Selected sheet:',
        selectedSheet
      );


      /*
       * Disable dropdown while loading
       */
      select.disabled = true;


      /*
       * Loading message
       */
      const oldTable = table;

      const loadingRow =
        document.createElement('div');

      loadingRow.className =
        'countries-loading';

      loadingRow.textContent =
        `Loading ${selectedSheet}...`;

      oldTable.replaceWith(
        loadingRow
      );


      try {

        /*
         * Fetch selected sheet
         */
        const newCountries =
          await fetchCountries(
            jsonURL,
            selectedSheet
          );


        console.log(
          `${selectedSheet} countries loaded:`,
          newCountries.length
        );


        /*
         * Create new table
         */
        const newTable =
          createTable(
            newCountries
          );


        /*
         * Replace loading
         */
        loadingRow.replaceWith(
          newTable
        );


        table = newTable;


      } catch (error) {

        console.error(
          'Sheet fetch error:',
          error
        );


        const errorMessage =
          document.createElement('div');

        errorMessage.className =
          'countries-error';

        errorMessage.textContent =
          `Unable to load ${selectedSheet} data.`;


        loadingRow.replaceWith(
          errorMessage
        );


        table = errorMessage;

      } finally {

        select.disabled = false;
      }
    }
  );


  console.log(
    'COUNTRIES BLOCK READY'
  );
}