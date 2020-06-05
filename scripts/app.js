let coreCheckbox,
  storeNumber,
  storeName,
  tillsNumber,
  analogCameras,
  IPCameras,
  newOrder;

const softwareLicences = [
  {
    name: "CORE I.P Video Management Suite",
    code: "CCOR-2001",
    cost: 100.1,
  },
  {
    name: "PROFESSIONAL I.P Video Management Suite",
    code: "CPRO-2001",
    cost: 800.2,
  },
  {
    name: "PREMIUM I.P Video Management Suite",
    code: "CPRM-2001",
    cost: 999.99,
  },

  {
    name: "CORE IP camera license",
    code: "CCOR-1001",
    cost: 61.3,
  },
  {
    name: "PROFESSIONAL camera license",
    code: "CPRO-1001",
    cost: 65.4,
  },
  {
    name: "PREMIUM camera license",
    code: "CPRM-1001",
    cost: 71.55,
  },

  {
    name: "CORE Camera to PROFESSIONAL Camera Upgrade",
    code: "CUPC-1001",
    cost: 15.29,
  },
  {
    name: "CORE Server to PROFESSIONAL Server Upgrade",
    code: "CUPG-1001",
    cost: 620.14,
  },

  {
    name: "Alarm panel integration license",
    code: "CALM-2000",
    cost: 351.19,
  },
  {
    name: "Three year Version Migration license",
    code: "CCVM-1003",
    cost: 19.12,
  },
  {
    name: "POS Integration base license (per site)",
    code: "CHBP-2000",
    cost: 143.29,
  },
  {
    name: "POS Integration channel license (per till)",
    code: "CHBP-1001",
    cost: 56.19,
  },
  {
    name:
      "POS Integration base license (per site) unlimited tills (Only for 10+ tills)",
    code: "CHBP-3000",
    cost: 568.06,
  },
  { name: "Single Licence per encoder", code: "CPRL-0004", cost: 0 },
];

function toggle(element, type) {
  let x = document.getElementById(element);
  if (x.style.display === "none") {
    x.style.display = type;
  } else if (element !== "orderID") {
    x.style.display = "none";
  }
}

function generateTableHead(table, data) {
  let thead = table.createTHead();
  let row = thead.insertRow();
  for (let key of data) {
    let th = document.createElement("th");
    let text = document.createTextNode(key);
    th.appendChild(text);
    row.appendChild(th);
  }
}

function generateTable(table, data) {
  for (let element of data) {
    let row = table.insertRow();
    for (key in element) {
      let cell = row.insertCell();
      let text = document.createTextNode(element[key]);
      cell.appendChild(text);
    }
  }
}

function updateOrderTable(total) {
  let order = document.querySelector("#order");
  order.innerHTML = "";
  let data = Object.keys(newOrder[0]);
  generateTable(order, newOrder);
  generateTableHead(order, data);

  let totalRow = order.insertRow();
  for (x = 0; x < 5; x++) {
    let newCell = totalRow.insertCell(x);
    if (x == 4) {
      let newText = document.createTextNode("£" + total.toFixed(2));
      newCell.appendChild(newText);
    }
  }
}

function getFormData() {
  let form = document.forms["licencesForm"];
  coreCheckbox = document.getElementById("coreCheckbox").checked;
  storeNumber = form.elements["storeNumber"].value;
  storeName = form.elements["storeName"].value;
  tillsNumber = parseInt(form.elements["tillsNumber"].value);
  analogCameras = parseInt(form.elements["analogCameras"].value);
  IPCameras = parseInt(form.elements["IPCameras"].value);

  if (!analogCameras) analogCameras = 0;
  if (!IPCameras) IPCameras = 0;
  if ((tillsNumber && analogCameras) || IPCameras || tillsNumber)
    calculateLicences();
}

function getLicenceByCode(code) {
  return softwareLicences.filter(function (softwareLicences) {
    return softwareLicences.code == code;
  });
}

function orderLicences(licence, qty, array) {
  const subTotal = qty * licence[0].cost;
  array.push({
    name: licence[0].name,
    code: licence[0].code,
    qty: qty,
    price: licence[0].cost.toFixed(2),
    total: subTotal.toFixed(2),
  });
}

function calculateLicences() {
  let packageType,
    cameraLicence,
    posLicence,
    posChannel,
    migrationLicence,
    encoderLicence,
    total = 0;

  let cameraLicenceReq = Math.ceil(analogCameras / 16) * 4 + 1 + IPCameras;
  newOrder = [];

  if (coreCheckbox) {
    packageType = getLicenceByCode("CCOR-2001");
    cameraLicence = getLicenceByCode("CCOR-1001");
  } else if (analogCameras + IPCameras < 150) {
    packageType = getLicenceByCode("CPRO-2001");
    cameraLicence = getLicenceByCode("CPRO-1001");
  } else {
    packageType = getLicenceByCode("CPRM-2001");
    cameraLicence = getLicenceByCode("CPRM-1001");
  }

  posLicence = getLicenceByCode("CHBP-2000");
  posChannel = getLicenceByCode("CHBP-1001");
  migrationLicence = getLicenceByCode("CCVM-1003");

  if (
    (IPCameras > 0 && tillsNumber > 0) ||
    (analogCameras > 0 && tillsNumber > 0)
  ) {
    // general order - new store or conversion
    orderLicences(packageType, 1, newOrder);
    orderLicences(cameraLicence, cameraLicenceReq, newOrder);
    orderLicences(posLicence, 1, newOrder);
    orderLicences(posChannel, tillsNumber, newOrder);
    orderLicences(migrationLicence, cameraLicenceReq, newOrder);

    total +=
      packageType[0].cost +
      cameraLicenceReq * cameraLicence[0].cost +
      posLicence[0].cost +
      tillsNumber * posChannel[0].cost +
      cameraLicenceReq * migrationLicence[0].cost;
  } else if (IPCameras > 0) {
    // additional IP licences
    orderLicences(cameraLicence, cameraLicenceReq - 1, newOrder);
    orderLicences(migrationLicence, cameraLicenceReq - 1, newOrder);

    total +=
      (cameraLicenceReq - 1) * cameraLicence[0].cost +
      (cameraLicenceReq - 1) * migrationLicence[0].cost;
  } else if (tillsNumber > 0) {
    // additional till licences
    orderLicences(posChannel, tillsNumber, newOrder);

    total += tillsNumber * posChannel[0].cost;
  }

  if (analogCameras > 0) {
    encoderLicence = getLicenceByCode("CPRL-0004");
    orderLicences(encoderLicence, 1, newOrder);
  }

  if (storeNumber && storeName) {
    orderID = document.querySelector("#orderID");
    orderID.innerHTML =
      "Store: <b>" +
      storeName +
      "-A" +
      storeNumber +
      "</b><br />Order: <b>IT-TJM1" +
      storeNumber +
      "</b>";
    toggle("orderID", "block");
  }
  updateOrderTable(total);
}

let prices = document.querySelector("#prices");
let data = Object.keys(softwareLicences[0]);
generateTable(prices, softwareLicences);
generateTableHead(prices, data);
