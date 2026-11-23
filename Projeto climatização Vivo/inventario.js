document.addEventListener("DOMContentLoaded", () => {
    const btnImportar = document.getElementById("btnDispararInput");
    const inputOculto = document.getElementById("inputExcelOculto");


    if (btnImportar && inputOculto) {
        btnImportar.addEventListener("click", () => {
        inputOculto.click();
    });


    inputOculto.addEventListener("change", (evento) => {
    const arquivo = evento.target.files[0];
        if (!arquivo) return;


        const nomeArquivo = arquivo.name.toLowerCase();
        if (!nomeArquivo.endsWith(".xlsx") && !nomeArquivo.endsWith(".xls")) {
            alert("Formato inválido! Por favor, selecione apenas arquivos em Excel (.xlsx ou .xls).");
            inputOculto.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = function (evt) {
        try {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const primeiraAba = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[primeiraAba];
            const dadosJson = XLSX.utils.sheet_to_json(worksheet);


    if (dadosJson.length === 0) {
        alert("Atenção: A planilha selecionada está vazia.");
        return;
    }


    // Salva os dados para o Painel ler
    localStorage.setItem("baseInventarioClimatizacao", JSON.stringify(dadosJson));
    alert(`Sucesso! ${dadosJson.length} registros importados. Acesse a aba "Painel" para visualizar os gráficos.`);
        inputOculto.value = "";
    } catch (erro) {
        console.error("Erro ao ler o arquivo:", erro);
            alert("Erro ao processar o arquivo Excel.");
            }
        };
            reader.readAsArrayBuffer(arquivo);
        });
    }
});