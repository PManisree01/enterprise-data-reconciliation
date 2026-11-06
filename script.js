// ============================================================
// ENTERPRISE FINANCIAL DATA ANALYTICS
// ============================================================

let data = [];
let revenueChart;
let transactionChart;
let customerChart;
let currentRows = [];
function updateDataQuality() {

    const totalRows = data.length;

    const missingRates = data.filter(
        row => !row.EUR_to_USD || isNaN(row.EUR_to_USD)
    ).length;

    const missingRevenue = data.filter(
        row => !row.USD_Revenue || isNaN(row.USD_Revenue)
    ).length;

    const validRows = totalRows - missingRates - missingRevenue;

    const quality =
        totalRows > 0
            ? ((validRows / totalRows) * 100).toFixed(1)
            : 0;

    document.getElementById("dataQuality").textContent =
        quality + "%";

    document.getElementById("missingRates").textContent =
        missingRates.toLocaleString();

    document.getElementById("missingRevenue").textContent =
        missingRevenue.toLocaleString();

    document.getElementById("reconciledTransactions").textContent =
        totalRows.toLocaleString();
}
let currentPage = 1;
const rowsPerPage = 10;



// ============================================================
// LOAD CSV
// ============================================================

Papa.parse("final_reconciled_data.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,

    complete: function(results) {

        data = results.data;

        // Convert numeric values
        data.forEach(row => {
            row.Euro_Value = Number(row.Euro_Value) || 0;
            row.EUR_to_USD = Number(row.EUR_to_USD) || 0;
            row.USD_Revenue = Number(row.USD_Revenue) || 0;
        });

        console.log("CSV loaded:", data.length);

        initializeFilters();
        buildDashboard(data);
        displayTransactions(data);
        updateDataQuality();
    },

    error: function(error) {
        console.error("CSV loading error:", error);
        alert("Unable to load final_reconciled_data.csv");
    }
});


// ============================================================
// BUILD DASHBOARD
// ============================================================

function buildDashboard(rows) {

    const totalEUR = rows.reduce(
        (sum, row) => sum + row.Euro_Value,
        0
    );

    const totalRevenue = rows.reduce(
        (sum, row) => sum + row.USD_Revenue,
        0
    );

    const transactions = rows.length;

    const users = new Set(
        rows.map(row => row.User_ID)
    ).size;

    const averageTransaction =
        transactions > 0
            ? totalRevenue / transactions
            : 0;


    document.getElementById("totalRevenue").textContent =
        formatUSD(totalRevenue);

    document.getElementById("totalEUR").textContent =
        formatEUR(totalEUR);

    document.getElementById("activeUsers").textContent =
        users.toLocaleString();

    document.getElementById("transactions").textContent =
        transactions.toLocaleString();

    document.getElementById("averageTransaction").textContent =
        formatUSD(averageTransaction);


    createRevenueChart(rows);
    createTransactionChart(rows);
    createCustomerChart(rows);
}


// ============================================================
// MONTH FILTER
// ============================================================

function initializeFilters() {

    const monthFilter =
        document.getElementById("monthFilter");

    const months = [
        ...new Set(
            data.map(row => row.Date.substring(0, 7))
        )
    ].sort();

    months.forEach(month => {

        const option =
            document.createElement("option");

        option.value = month;

        option.textContent =
            formatMonth(month);

        monthFilter.appendChild(option);
    });


    document
        .getElementById("searchInput")
        .addEventListener(
            "input",
            applyFilters
        );

    monthFilter.addEventListener(
        "change",
        applyFilters
    );


    document
        .getElementById("resetFilters")
        .addEventListener(
            "click",
            resetFilters
        );
    document
        .getElementById("fromDate")
        .addEventListener("change", applyFilters);
    document
        .getElementById("toDate")
        .addEventListener("change", applyFilters);
    document
        .getElementById("downloadCSV")
        .addEventListener(
        "click",
        downloadCSV
    );
    document
    .getElementById("prevPage")
    .addEventListener("click", function() {

        if (currentPage > 1) {
            currentPage--;
            renderPage();
        }

    });


document
    .getElementById("nextPage")
    .addEventListener("click", function() {

        const totalPages =
            Math.ceil(currentRows.length / rowsPerPage);

        if (currentPage < totalPages) {
            currentPage++;
            renderPage();
        }

    });
}


// ============================================================
// APPLY FILTERS
// ============================================================

function applyFilters() {

    const search =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase()
            .trim();

    const selectedMonth =
        document
            .getElementById("monthFilter")
            .value;
            const fromDate = document
            .getElementById("fromDate")
            .value;
            const toDate = document
            .getElementById("toDate")
            .value;


    const filteredData = data.filter(row => {

        const customer =
            (row.name || "").toLowerCase();

        const userID =
            (row.User_ID || "").toLowerCase();

        const month =
            row.Date.substring(0, 7);


        const matchesSearch =
            customer.includes(search) ||
            userID.includes(search);

        const matchesMonth =
            selectedMonth === "all" ||
            month === selectedMonth;
        const matchesFromDate = !fromDate ||
            row.Date >= fromDate;
        const matchesToDate = !toDate ||
        row.Date <= toDate;

        return (
            matchesSearch &&
            matchesMonth &&
            matchesFromDate &&
            matchesToDate
        );
    });


    buildDashboard(filteredData);
    displayTransactions(filteredData);
}


// ============================================================
// RESET FILTERS
// ============================================================

function resetFilters() {

    document.getElementById("searchInput").value = "";
    
    document.getElementById("monthFilter").value = "all";
    document.getElementById("fromDate").value = "";
    document.getElementById("toDate").value = "";


    buildDashboard(data);
    displayTransactions(data);
}


// ============================================================
// TRANSACTION TABLE
// ============================================================
function displayTransactions(rows) {

    currentRows = rows;
    currentPage = 1;

    renderPage();
}


// ============================================================
// RENDER TABLE PAGE
// ============================================================

function renderPage() {

    const table =
        document.getElementById("transactionTable");

    table.innerHTML = "";

    const totalPages =
        Math.max(
            1,
            Math.ceil(currentRows.length / rowsPerPage)
        );

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    const start =
        (currentPage - 1) * rowsPerPage;

    const end =
        start + rowsPerPage;

    const visibleData =
        currentRows.slice(start, end);


    visibleData.forEach(row => {

        const tr =
            document.createElement("tr");

        tr.innerHTML = `
            <td>${formatDate(row.Date)}</td>
            <td>${row.User_ID || "-"}</td>
            <td>${row.name || "-"}</td>
            <td>${row.Product_ID || "-"}</td>
            <td>${formatEUR(row.Euro_Value)}</td>
            <td>${row.EUR_to_USD.toFixed(4)}</td>
            <td>${formatUSD(row.USD_Revenue)}</td>
        `;

        table.appendChild(tr);
    });


    document.getElementById("pageInfo").textContent =
        `Page ${currentPage} of ${totalPages}`;

    document.getElementById("visibleRows").textContent =
        currentRows.length.toLocaleString();


    document.getElementById("prevPage").disabled =
        currentPage === 1;

    document.getElementById("nextPage").disabled =
        currentPage === totalPages;
}


// ============================================================
// REVENUE CHART
// ============================================================

function createRevenueChart(rows) {

    const monthlyRevenue = {};


    rows.forEach(row => {

        const month =
            row.Date.substring(0, 7);

        if (!monthlyRevenue[month]) {
            monthlyRevenue[month] = 0;
        }

        monthlyRevenue[month] += row.USD_Revenue;
    });


    const months =
        Object.keys(monthlyRevenue).sort();

    const revenue =
        months.map(month =>
            monthlyRevenue[month]
        );


    if (revenueChart) {
        revenueChart.destroy();
    }


    revenueChart = new Chart(
        document.getElementById("revenueChart"),
        {
            type: "line",

            data: {
                labels: months,

                datasets: [{
                    label: "USD Revenue",
                    data: revenue,
                    tension: 0.3,
                    fill: true
                }]
            },

           options: {
            responsive: true,
            interaction: {
                intersect: false,
                mode: "index"
            },
            animation: {
                duration: 1000,
                easing: "easeOutQuart"
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function(context) {
                            return " USD " +
                            Number(context.raw).toLocaleString("en-US",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }
                            );
                        }
                    }
                }
            },
            scales: {
                    y: {
                        ticks: {
                            callback: value =>
                                "$" +
                                (value / 1000000).toFixed(1) +
                                "M"
                        }
                    }
                }
            }
        }
    );
}


// ============================================================
// TRANSACTION CHART
// ============================================================

function createTransactionChart(rows) {

    const monthlyTransactions = {};


    rows.forEach(row => {

        const month =
            row.Date.substring(0, 7);

        if (!monthlyTransactions[month]) {
            monthlyTransactions[month] = 0;
        }

        monthlyTransactions[month]++;
    });


    const months =
        Object.keys(monthlyTransactions).sort();

    const transactions =
        months.map(month =>
            monthlyTransactions[month]
        );


    if (transactionChart) {
        transactionChart.destroy();
    }


    transactionChart = new Chart(
        document.getElementById("transactionChart"),
        {
            type: "bar",

            data: {

                labels: months,

                datasets: [{
                    label: "Transactions",
                    data: transactions,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                animation: {
                    duration: 900,
                    easing: "easeOutQuart"
                },
                interaction: {
                    intersect: false,
                    mode: "index"
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            label: function(context) {
                                return " Transactions: " +
                                Number(context.raw).toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                            return Number(value).toLocaleString();
                        }
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0
                    }
                }
            }
        }
    }
);
}


// ============================================================
// TOP 5 CUSTOMERS
// ============================================================

function createCustomerChart(rows) {

    const customers = {};

    rows.forEach(row => {

        const customer =
            row.name || row.User_ID || "Unknown";

        if (!customers[customer]) {
            customers[customer] = 0;
        }

        customers[customer] += row.USD_Revenue;
    });

    const topCustomers =
        Object.entries(customers)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

    const names =
        topCustomers.map(item => item[0]);

    const revenue =
        topCustomers.map(item => item[1]);

    if (customerChart) {
        customerChart.destroy();
    }

    customerChart = new Chart(
        document.getElementById("customerChart"),
        {
            type: "bar",

            data: {
                labels: names,

                datasets: [{
                    label: "Revenue",
                    data: revenue,
                    borderRadius: 6
                }]
            },

            options: {
                indexAxis: "y",

                responsive: true,

                animation: {
                    duration: 900,
                    easing: "easeOutQuart"
                },

                interaction: {
                    intersect: false,
                    mode: "index"
                },

                plugins: {
                    legend: {
                        display: false
                    },

                    tooltip: {
                        enabled: true,

                        callbacks: {
                            label: function(context) {

                                return " Revenue: $" +
                                    Number(context.raw)
                                        .toLocaleString("en-US", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        });
                            }
                        }
                    }
                },

                scales: {
                    x: {
                        beginAtZero: true,

                        ticks: {
                            callback: function(value) {
                                return "$" +
                                    Number(value)
                                        .toLocaleString("en-US");
                            }
                        }
                    }
                }
            }
        }
    );
}


// ============================================================
// FORMATTING FUNCTIONS
// ============================================================

function formatUSD(value) {

    return new Intl.NumberFormat(
        "en-US",
        {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 2
        }
    ).format(value);
}


function formatEUR(value) {

    return new Intl.NumberFormat(
        "en-US",
        {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 2
        }
    ).format(value);
}


function formatDate(date) {

    if (!date) return "-";

    return new Date(date).toLocaleDateString(
        "en-GB"
    );
}


function formatMonth(month) {

    const date = new Date(month + "-01");

    return date.toLocaleDateString(
        "en-US",
        {
            month: "long",
            year: "numeric"
        }
    );
}
// ============================================================
// DOWNLOAD FILTERED DATA
// ============================================================

function downloadCSV() {

    const search =
        document.getElementById("searchInput").value.toLowerCase().trim();

    const selectedMonth =
        document.getElementById("monthFilter").value;

    const fromDate =
        document.getElementById("fromDate").value;

    const toDate =
        document.getElementById("toDate").value;

    const filteredData = data.filter(row => {

        const customer = (row.name || "").toLowerCase();
        const userID = (row.User_ID || "").toLowerCase();
        const month = row.Date.substring(0, 7);

        const matchesSearch =
            customer.includes(search) ||
            userID.includes(search);

        const matchesMonth =
            selectedMonth === "all" ||
            month === selectedMonth;

        const matchesFromDate =
            !fromDate ||
            row.Date >= fromDate;

        const matchesToDate =
            !toDate ||
            row.Date <= toDate;

        return (
            matchesSearch &&
            matchesMonth &&
            matchesFromDate &&
            matchesToDate
        );
    });

    const csv = Papa.unparse(filteredData);

    const blob = new Blob(
        [csv],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "filtered_reconciled_data.csv";

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}