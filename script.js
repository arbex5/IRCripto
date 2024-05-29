document.addEventListener('DOMContentLoaded', (event) => {
    const addRowButton = document.getElementById("add-row");
    const saveButton = document.getElementById("save");
    const loadButton = document.getElementById("load");
    const loadFileInput = document.getElementById("load-file");
    const tableBody = document.querySelector("table#asset-table tbody");
    const totalValueElement = document.getElementById("total-value");

    // Carregar dados do localStorage
    function loadTableData() {
        const storedData = JSON.parse(localStorage.getItem("assetData")) || [];
        const dollarRate = localStorage.getItem("dollarRate") || 5.0343; 

        document.getElementById("dollar-rate").value = dollarRate;

        // Limpar a tabela antes de carregar os dados
        tableBody.innerHTML = ''; // Limpa as linhas existentes

        storedData.forEach(item => {
            addRow(item.name, item.symbol, item.usdValue, item.quantity);
        });

        calculateTotal();
    }

    // Salvar dados no localStorage e arquivo
    function saveTableData() {
        const rows = tableBody.querySelectorAll("tr");
        const assetData = [];
        const dollarRate = document.getElementById("dollar-rate").value;

        rows.forEach(row => {
            assetData.push({
                name: row.querySelector(".asset-name").value,
                symbol: row.querySelector(".asset-symbol").value,
                usdValue: row.querySelector(".asset-usd-value").value,
                quantity: row.querySelector(".asset-quantity").value
            });
        });

        const dataToSave = {
            dollarRate: dollarRate,
            assetData: assetData
        };

        localStorage.setItem("assetData", JSON.stringify(assetData));
        localStorage.setItem("dollarRate", dollarRate);

        const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: "application/json;charset=utf-8" });
        saveAs(blob, "dados_ativos.json");
    }

    // Carregar dados ao iniciar a página
    loadTableData();

    function addRow(name = "", symbol = "", usdValue = "", quantity = "") {
        const newRow = tableBody.insertRow();
        newRow.innerHTML = `
            <td><input type="text" class="asset-name" value="${name}"></td>
            <td><input type="text" class="asset-symbol" value="${symbol}"></td>
            <td><input type="number" step="0.01" class="asset-usd-value" value="${usdValue}"></td>
            <td><input type="number" step="0.00000001" class="asset-quantity" value="${quantity}"></td>
            <td class="asset-brl-value"></td>
            <td><svg class="delete-row" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg></td>
        `;

        // Adiciona os eventos de input aos campos da nova linha (após a criação da linha)
        const usdValueInput = newRow.querySelector(".asset-usd-value");
        const quantityInput = newRow.querySelector(".asset-quantity");
        usdValueInput.addEventListener("input", calculateTotal);
        quantityInput.addEventListener("input", calculateTotal);

        // Adiciona o evento de clique ao novo botão "Excluir" (após a criação da linha)
        newRow.querySelector(".delete-row").addEventListener("click", function(event) {
            deleteRow(event.target.parentNode.parentNode); // Corrigido o alvo do evento
        });
    }

    // Função para calcular o valor da linha e o total
    function calculateTotal() {
        const dollarRate = parseFloat(document.getElementById("dollar-rate").value);
        const rows = tableBody.querySelectorAll("tr");
        let totalBrl = 0;

        rows.forEach(row => {
            const usdValue = parseFloat(row.querySelector(".asset-usd-value").value) || 0;
            const quantity = parseFloat(row.querySelector(".asset-quantity").value) || 0;
            const brlValue = usdValue * quantity * dollarRate;

            row.querySelector(".asset-brl-value").textContent = brlValue.toFixed(2);
            totalBrl += brlValue;
        });

        totalValueElement.textContent = `Valor Total em BRL: R$ ${totalBrl.toFixed(2)}`;
    }

    // Função para excluir a linha
    function deleteRow(rowToDelete) {
        tableBody.removeChild(rowToDelete);
        calculateTotal();
    }

    // Evento de clique no botão "Adicionar Linha"
    addRowButton.addEventListener("click", addRow);

    // Evento de clique no botão "Salvar Dados"
    saveButton.addEventListener("click", saveTableData);

    // Evento de clique no botão "Carregar Dados"
    loadButton.addEventListener("click", () => {
        loadFileInput.click();
    });

    loadFileInput.addEventListener("change", () => {
        const file = loadFileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const data = JSON.parse(e.target.result);
                document.getElementById("dollar-rate").value = data.dollarRate;

                // Limpar a tabela antes de carregar os novos dados
                tableBody.innerHTML = '';

                data.assetData.forEach(item => {
                    addRow(item.name, item.symbol, item.usdValue, item.quantity);
                });

                calculateTotal(); 
            };
            reader.readAsText(file);
        }
    });
});

