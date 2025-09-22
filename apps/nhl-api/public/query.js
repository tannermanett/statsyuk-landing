document.addEventListener('DOMContentLoaded', async () => {
    let tableConfig;
    const resultInfo = document.createElement('div');

    try {
        const response = await fetch('/api/tableConfig');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        tableConfig = await response.json();
    } catch (error) {
        console.error('Error fetching table configuration:', error);
        return;
    }

    const tableSelect = document.getElementById('table-select');
    const filterBuilder = document.getElementById('filter-builder');
    const queryForm = document.getElementById('query-form');

    Object.entries(tableConfig).forEach(([tableName, config]) => {
        const option = document.createElement('option');
        option.value = tableName;
        option.textContent = config.name || tableName;
        tableSelect.appendChild(option);
    });

    tableSelect.addEventListener('change', (e) => {
        initializeFilterBuilder(e.target.value);
    });

    const resetButton = document.getElementById('reset-filters');
    resetButton.addEventListener('click', () => {
        initializeFilterBuilder(tableSelect.value);
    });

    function createRuleElement(table, isFirstContainer = true) {
        if (!tableConfig[table] || !tableConfig[table].columns) {
            console.error('Table configuration not found for:', table);
            return document.createElement('div');
        }

        const columns = tableConfig[table].columns;
        const ruleContainer = document.createElement('div');
        ruleContainer.classList.add('rule-container');
        
        // Create operator and add rule button row first
        const controlRow = document.createElement('div');
        controlRow.classList.add('control-row');
        controlRow.innerHTML = `
            <select class="rule-operator" style="width: 70px;">
            ${isFirstContainer ? 
                '<option value="WHERE">WHERE</option>' : 
                `<option value="AND">AND</option>
                 <option value="OR">OR</option>`
            }
            </select>
            <button type="button" class="add-rule">+ Rule</button>
        `;

        const addButton = controlRow.querySelector('.add-rule');
        addButton.addEventListener('click', () => {
            if (!ruleContainer.querySelector('.rule')) {
                const ruleDiv = document.createElement('div');
                ruleDiv.classList.add('rule');
                ruleDiv.innerHTML = `
                <div style="display: inline-flex; align-items: left; gap: 5px;">
                    <select class="rule-column">
                        ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                    </select>
                    <select class="rule-comparison">
                        <option value="=">=</option>
                        <option value="!=">≠</option>
                        <option value="<"><</option>
                        <option value=">">></option>
                        <option value="<=">≤</option>
                        <option value=">=">≥</option>
                        <option value="LIKE">LIKE</option>
                        <option value="IN">IN</option>
                        <option value="IS NULL">IS NULL</option>
                        <option value="IS NOT NULL">IS NOT NULL</option>
                    </select>
                    <input type="text" class="rule-value" placeholder="enter value">
                    <button type="button" class="remove-rule" style="background: red; color: white;">×</button>
                </div>
                `;

                const operatorSelect = ruleDiv.querySelector('.rule-comparison');
                const valueInput = ruleDiv.querySelector('.rule-value');
                const removeButton = ruleDiv.querySelector('.remove-rule');
                
                operatorSelect.addEventListener('change', () => {
                    const isNullOperator = ['IS NULL', 'IS NOT NULL'].includes(operatorSelect.value);
                    valueInput.style.display = isNullOperator ? 'none' : 'block';
                });

                removeButton.addEventListener('click', () => {
                    const currentContainer = ruleDiv.closest('.rule-container');
                    const nextContainer = currentContainer.nextSibling;
                    const remainingContainers = filterBuilder.querySelectorAll('.rule-container');
                    
                    if (remainingContainers.length <= 2) { 
                        filterBuilder.innerHTML = '';
                        const newRuleContainer = createRuleElement(table, true);
                        filterBuilder.appendChild(newRuleContainer);
                    } else {
                        currentContainer.remove();
                        if (nextContainer) {
                            nextContainer.remove();
                        }

                        const firstContainer = filterBuilder.querySelector('.rule-container');
                        if (firstContainer) {
                            const firstOperator = firstContainer.querySelector('.rule-operator');
                            if (firstOperator) {
                                firstOperator.innerHTML = '<option value="WHERE">WHERE</option>';
                            }
                        }
                    }
                });

                ruleContainer.appendChild(ruleDiv);

                if (!ruleContainer.nextSibling) {
                    const newRuleContainer = createRuleElement(table, false);
                    ruleContainer.parentNode.appendChild(newRuleContainer);
                }
            } else {
                const nextContainer = ruleContainer.nextSibling;
                if (nextContainer) {
                    const nextAddButton = nextContainer.querySelector('.add-rule');
                    if (nextAddButton) {
                        nextAddButton.click();
                    }
                }
            }
        });

        ruleContainer.appendChild(controlRow);
        return ruleContainer;
    }

    function initializeFilterBuilder(table) {
        const filterBuilder = document.getElementById('filter-builder');
        filterBuilder.innerHTML = '';
        filterBuilder.appendChild(createRuleElement(table, true));
    }

    function collectFilters(element) {
        const ruleContainers = element.querySelectorAll('.rule-container');
        const conditions = [];

        ruleContainers.forEach((container, index) => {
            const rule = container.querySelector('.rule');
            if(!rule)return;
           
            const column = rule.querySelector('.rule-column')?.value;
            const operator = rule.querySelector('.rule-comparison')?.value;
            const value = rule.querySelector('.rule-value')?.value;
            const containerOperator = container.querySelector('.rule-operator')?.value;

            if (!['IS NULL', 'IS NOT NULL'].includes(operator) && !value?.trim()) {
                return;
            }

                // Handle IN operator
            let processedValue = value;
            if (operator === 'IN') {
                 processedValue = value.split(',').map(v => v.trim());
            } else if (operator === 'LIKE') {                           
                processedValue = `%${value}%`;
            } else if (['IS NULL', 'IS NOT NULL'].includes(operator)) {
                processedValue = null;
            }

            conditions.push({
                column,
                operator,
                value: ['IS NULL', 'IS NOT NULL'].includes(operator) ? null :
                    operator === 'LIKE' ? `%${value}%` : value,
                logicalOperator: containerOperator
            });
        });

        console.log('Collected filters:', conditions);

        return conditions;
    }

    // Initialize the first filter builder
    initializeFilterBuilder(tableSelect.value);

    queryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("submitted")

        const selectedTable = tableSelect.value;
        const conditions = collectFilters(filterBuilder);

        const table = document.getElementById('query-results');
        table.querySelector('thead').innerHTML = '';
        table.querySelector('tbody').innerHTML = '<tr><td colspan="100%">Loading...</td></tr>';
        resultInfo.textContent = '';

        try {
            const response = await fetch('/api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    table: selectedTable,
                    columns: ['*'],
                    filters: conditions
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error);
            }

            console.log('Query results:', data);
            displayResults(data);
        } catch (error) {
            console.error('Error executing query:', error);
            table.querySelector('tbody').innerHTML = '';
            alert(error.message);
        }
    });

    function displayResults(data) {
        console.log('Displaying results:', data.length);
        const table = document.getElementById('query-results');
        const thead = table.querySelector('thead');
        const tbody = table.querySelector('tbody');
        const rowLimit = 5000;

        thead.innerHTML = '';
        tbody.innerHTML = '';

        resultInfo.style.textAlign = 'center';
        resultInfo.style.marginBottom = '10px';
        resultInfo.style.color = 'white';

        if (data.length > rowLimit) {
            resultInfo.textContent = `Showing ${rowLimit} of ${data.length} results. Please export the full results to view all.`;
        } else {
            resultInfo.textContent = `Showing all ${data.length} results.`;
        }

        table.parentNode.insertBefore(resultInfo, table);

        if (data.length === 0) {
            // Create a single row with "No data to display" message
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.textContent = 'No data to display';
            td.style.textAlign = 'center';
            td.style.padding = '20px';
            td.colSpan = '100%'; // Spans across all columns
            tr.appendChild(td);
            tbody.appendChild(tr);
            return;
        }


        table.dataset.fullResults = JSON.stringify(data);

        const headerRow = document.createElement('tr');
        Object.keys(data[0]).forEach(key => {
            const th = document.createElement('th');
            th.textContent = key;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        const displayResult = data.slice(0, rowLimit);
        displayResult.forEach(row => {
            const tr = document.createElement('tr');
            Object.values(row).forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        
    }

    document.getElementById('export-csv').addEventListener('click', () => {
        const table = document.getElementById('query-results');
        if(!table)return;

        console.log('Exporting CSV:', table);

        const fullData = JSON.parse(table.dataset.fullResults || '[]');
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent);
        const rows = fullData.map(row => Object.values(row));
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'query-results.csv');
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            const sectionId = mutation.target.querySelector('a').getAttribute('href').slice(1);
            if (sectionId === 'Queries' && !mutation.target.classList.contains('active')) {
                clearTable();
                console.log('Queries section inactive, clearing table');
            }
        });
    });
    
    // Just observe the queries nav item
    const queriesNavItem = document.querySelector('nav ul li a[href="#Queries"]').parentElement;
    observer.observe(queriesNavItem, {
        attributes: true,
        attributeFilter: ['class']
    });

    function clearTable() {
        const table = document.getElementById('query-results');
        table.querySelector('thead').innerHTML = '';
        table.querySelector('tbody').innerHTML = '';
        resultInfo.textContent = 'Table cleared';
        console.log('Table cleared');
    }
});