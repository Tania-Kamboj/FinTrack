var currencySymbols = {
  USD: "$",
  EUR: "\u20ac",
  GBP: "\u00a3",
  INR: "\u20b9",
  JPY: "\u00a5"
};

var users = JSON.parse(localStorage.getItem("fintrack_users")) || [];
var currentUser = localStorage.getItem("fintrack_current_user") || "";
var transactions = [];
var userName = "Guest";
var selectedCurrency = "USD";
var darkMode = false;

var authPage = document.getElementById("authPage");
var app = document.getElementById("app");
var authHeading = document.getElementById("authHeading");
var authCopy = document.getElementById("authCopy");
var authMessage = document.getElementById("authMessage");
var loginForm = document.getElementById("loginForm");
var registerForm = document.getElementById("registerForm");
var loginLink = document.getElementById("loginLink");
var registerLink = document.getElementById("registerLink");

var displayName = document.getElementById("displayName");
var balanceValue = document.getElementById("balanceValue");
var incomeValue = document.getElementById("incomeValue");
var expenseValue = document.getElementById("expenseValue");
var countValue = document.getElementById("countValue");
var activeCurrency = document.getElementById("activeCurrency");
var chart = document.getElementById("cashFlowChart");
var transactionBody = document.getElementById("transactionBody");
var emptyState = document.getElementById("emptyState");
var transactionModal = document.getElementById("transactionModal");
var dateInput = document.getElementById("dateInput");
var searchInput = document.getElementById("searchInput");
var filterSelect = document.getElementById("filterSelect");

document.getElementById("showRegisterBtn").onclick = showRegister;
document.getElementById("showLoginBtn").onclick = showLogin;
loginForm.onsubmit = loginUser;
registerForm.onsubmit = registerUser;

document.getElementById("logoutBtn").onclick = logoutUser;
document.getElementById("themeToggle").onclick = toggleDarkMode;
document.getElementById("openModalBtn").onclick = openModal;
document.getElementById("closeModalBtn").onclick = closeModal;
document.getElementById("transactionForm").onsubmit = addTransaction;
document.getElementById("profileForm").onsubmit = saveProfile;
document.getElementById("resetBtn").onclick = resetAllData;
searchInput.oninput = showTransactions;
filterSelect.onchange = showTransactions;

transactionModal.onclick = function (event) {
  if (event.target === transactionModal) {
    closeModal();
  }
};

function showRegister() {
  authMessage.classList.remove("show");
  authHeading.innerText = "Create Account";
  authCopy.innerText = "Register with a username and password. Data stays in localStorage.";
  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");
  loginLink.classList.add("hidden");
  registerLink.classList.remove("hidden");
}

function showLogin() {
  authMessage.classList.remove("show");
  authHeading.innerText = "Welcome Back";
  authCopy.innerText = "Login to continue tracking your income and expenses.";
  registerForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
  registerLink.classList.add("hidden");
  loginLink.classList.remove("hidden");
}

function showMessage(message) {
  authMessage.innerText = message;
  authMessage.classList.add("show");
}

function registerUser(event) {
  event.preventDefault();

  var username = document.getElementById("registerUsername").value.trim();
  var password = document.getElementById("registerPassword").value.trim();

  if (username.length < 3 || password.length < 3) {
    showMessage("Username and password must be at least 3 characters.");
    return;
  }

  for (var i = 0; i < users.length; i++) {
    if (users[i].username.toLowerCase() === username.toLowerCase()) {
      showMessage("This username already exists. Please login.");
      return;
    }
  }

  users.push({
    username: username,
    password: password
  });

  localStorage.setItem("fintrack_users", JSON.stringify(users));
  currentUser = username;
  localStorage.setItem("fintrack_current_user", currentUser);

  userName = username;
  selectedCurrency = "USD";
  darkMode = false;
  transactions = [];
  saveSettings();
  saveTransactions();

  registerForm.reset();
  openApp();
}

function loginUser(event) {
  event.preventDefault();

  var username = document.getElementById("loginUsername").value.trim();
  var password = document.getElementById("loginPassword").value.trim();
  var foundUser = false;

  for (var i = 0; i < users.length; i++) {
    if (users[i].username === username && users[i].password === password) {
      foundUser = true;
      break;
    }
  }

  if (!foundUser) {
    showMessage("Invalid username or password.");
    return;
  }

  currentUser = username;
  localStorage.setItem("fintrack_current_user", currentUser);
  loginForm.reset();
  openApp();
}

function logoutUser() {
  currentUser = "";
  localStorage.removeItem("fintrack_current_user");
  app.classList.add("hidden");
  authPage.classList.remove("hidden");
  document.body.classList.remove("dark");
  showLogin();
}

function openApp() {
  loadUserData();
  authPage.classList.add("hidden");
  app.classList.remove("hidden");
  updateDashboard();
}

function userTransactionKey() {
  return "fintrack_" + currentUser + "_transactions";
}

function userSettingsKey() {
  return "fintrack_" + currentUser + "_settings";
}

function loadUserData() {
  transactions = JSON.parse(localStorage.getItem(userTransactionKey())) || [];

  var savedSettings = JSON.parse(localStorage.getItem(userSettingsKey()));

  if (savedSettings) {
    userName = savedSettings.name;
    selectedCurrency = savedSettings.currency;
    darkMode = savedSettings.darkMode;
  } else {
    userName = currentUser;
    selectedCurrency = "USD";
    darkMode = false;
  }
}

function saveTransactions() {
  localStorage.setItem(userTransactionKey(), JSON.stringify(transactions));
}

function saveSettings() {
  var settings = {
    name: userName,
    currency: selectedCurrency,
    darkMode: darkMode
  };

  localStorage.setItem(userSettingsKey(), JSON.stringify(settings));
}

function openModal() {
  transactionModal.classList.add("show");
  transactionModal.setAttribute("aria-hidden", "false");
  dateInput.value = new Date().toISOString().slice(0, 10);
}

function closeModal() {
  transactionModal.classList.remove("show");
  transactionModal.setAttribute("aria-hidden", "true");
  document.getElementById("transactionForm").reset();
}

function addTransaction(event) {
  event.preventDefault();

  var type = document.getElementById("typeInput").value;
  var description = document.getElementById("descriptionInput").value.trim();
  var amount = Number(document.getElementById("amountInput").value);
  var date = document.getElementById("dateInput").value;
  var category = document.getElementById("categoryInput").value;

  if (description === "" || amount <= 0 || date === "" || category === "") {
    alert("Please fill all transaction details correctly.");
    return;
  }

  var newTransaction = {
    id: Date.now(),
    type: type,
    description: description,
    amount: amount,
    date: date,
    category: category
  };

  transactions.push(newTransaction);
  saveTransactions();
  closeModal();
  updateDashboard();
}

function deleteTransaction(id) {
  var newList = [];

  for (var i = 0; i < transactions.length; i++) {
    if (transactions[i].id !== id) {
      newList.push(transactions[i]);
    }
  }

  transactions = newList;
  saveTransactions();
  updateDashboard();
}

function saveProfile(event) {
  event.preventDefault();

  userName = document.getElementById("profileName").value.trim();
  selectedCurrency = document.getElementById("currencySelect").value;

  if (userName === "") {
    userName = currentUser;
  }

  saveSettings();
  updateDashboard();
}

function toggleDarkMode() {
  darkMode = !darkMode;
  saveSettings();
  applyTheme();
}

function resetAllData() {
  var confirmReset = confirm("Reset all transactions and settings for this account?");

  if (!confirmReset) {
    return;
  }

  transactions = [];
  userName = currentUser;
  selectedCurrency = "USD";
  darkMode = false;

  localStorage.removeItem(userTransactionKey());
  localStorage.removeItem(userSettingsKey());

  searchInput.value = "";
  filterSelect.value = "all";
  updateDashboard();
}

function updateDashboard() {
  applyTheme();
  showProfile();
  showSummary();
  showChart();
  showTransactions();
}

function applyTheme() {
  if (darkMode) {
    document.body.classList.add("dark");
    document.getElementById("themeToggle").innerText = "Light Mode";
  } else {
    document.body.classList.remove("dark");
    document.getElementById("themeToggle").innerText = "Dark Mode";
  }
}

function showProfile() {
  displayName.innerText = userName;
  activeCurrency.innerText = selectedCurrency;
  document.getElementById("profileName").value = userName;
  document.getElementById("currencySelect").value = selectedCurrency;
}

function showSummary() {
  var income = 0;
  var expense = 0;

  for (var i = 0; i < transactions.length; i++) {
    if (transactions[i].type === "income") {
      income = income + transactions[i].amount;
    } else {
      expense = expense + transactions[i].amount;
    }
  }

  balanceValue.innerText = formatMoney(income - expense);
  incomeValue.innerText = formatMoney(income);
  expenseValue.innerText = formatMoney(expense);
  countValue.innerText = transactions.length;
}

function showTransactions() {
  var searchText = searchInput.value.toLowerCase();
  var selectedType = filterSelect.value;

  transactionBody.innerHTML = "";
  var visibleCount = 0;

  for (var i = transactions.length - 1; i >= 0; i--) {
    var item = transactions[i];
    var text = (item.description + " " + item.category + " " + item.date).toLowerCase();
    var matchesSearch = text.includes(searchText);
    var matchesType = selectedType === "all" || item.type === selectedType;

    if (matchesSearch && matchesType) {
      visibleCount++;

      var row = document.createElement("tr");
      var sign = item.type === "income" ? "+" : "-";
      var amountClass = item.type === "income" ? "amount-income" : "amount-expense";

      row.innerHTML =
        "<td>" + item.date + "</td>" +
        "<td>" + item.description + "</td>" +
        "<td>" + item.category + "</td>" +
        "<td><span class='type-pill'>" + capitalize(item.type) + "</span></td>" +
        "<td class='" + amountClass + "'>" + sign + formatMoney(item.amount) + "</td>" +
        "<td><button class='delete-btn' onclick='deleteTransaction(" + item.id + ")'>Delete</button></td>";

      transactionBody.appendChild(row);
    }
  }

  if (visibleCount === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
  }
}

function showChart() {
  chart.innerHTML = "";

  if (transactions.length === 0) {
    chart.innerHTML = "<p class='empty-state'>Chart will appear after you add transactions.</p>";
    return;
  }

  var days = [];
  var groupedData = {};

  for (var i = 0; i < transactions.length; i++) {
    var date = transactions[i].date;

    if (!groupedData[date]) {
      groupedData[date] = {
        income: 0,
        expense: 0
      };
      days.push(date);
    }

    if (transactions[i].type === "income") {
      groupedData[date].income += transactions[i].amount;
    } else {
      groupedData[date].expense += transactions[i].amount;
    }
  }

  days.sort();
  days = days.slice(-7);

  var highestAmount = 1;

  for (var j = 0; j < days.length; j++) {
    var dayIncome = groupedData[days[j]].income;
    var dayExpense = groupedData[days[j]].expense;

    if (dayIncome > highestAmount) {
      highestAmount = dayIncome;
    }

    if (dayExpense > highestAmount) {
      highestAmount = dayExpense;
    }
  }

  for (var k = 0; k < days.length; k++) {
    var currentDay = days[k];
    var incomeHeight = (groupedData[currentDay].income / highestAmount) * 150;
    var expenseHeight = (groupedData[currentDay].expense / highestAmount) * 150;

    if (incomeHeight < 6) {
      incomeHeight = 6;
    }

    if (expenseHeight < 6) {
      expenseHeight = 6;
    }

    var column = document.createElement("div");
    column.className = "chart-column";
    column.innerHTML =
      "<div class='bar-pair'>" +
      "<div class='bar income' style='height:" + incomeHeight + "px'></div>" +
      "<div class='bar expense' style='height:" + expenseHeight + "px'></div>" +
      "</div>" +
      "<span>" + shortDate(currentDay) + "</span>";

    chart.appendChild(column);
  }
}

function formatMoney(amount) {
  return currencySymbols[selectedCurrency] + Number(amount).toFixed(2);
}

function shortDate(dateValue) {
  var date = new Date(dateValue);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
if (currentUser !== "") {
  openApp();
} else {
  showLogin();
}
