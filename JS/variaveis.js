async function loadGlobalVariables() {
    const response = await fetch('../php/get_variables.php');
    const data = await response.json();
    
    const var1 = data.var1;
    const var2 = data.var2;

    // Use var1 e var2 em cálculos ou outras operações
}