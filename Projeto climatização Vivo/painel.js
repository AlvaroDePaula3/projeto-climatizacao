document.addEventListener("DOMContentLoaded", () => {
    const ctxRegioes = document.getElementById('graficoRegioes');
    if (!ctxRegioes) return; // Garante que só roda se estiver na página do painel

    const dadosBrutos = JSON.parse(localStorage.getItem("baseInventarioClimatizacao")) || [];

    const coresTipos = {
        "SPLIT": "#00FA9A",
        "SELF": "#FF69B4",
        "ACJ": "#660099",
        "CHILLER": "#00BFFF",
        "FANCOIL": "#FFFF33"
    };

    const selecionarCoordenacao = document.getElementById("coordenacao");
    const selecionarTipo = document.getElementById("tipoEquipamento");

    let instanciaGraficosRegioes = null;
    let instanciaGraficoSecundario = null;

    function atualizarGraficos() {
        const filtroCoordenacao = selecionarCoordenacao ? selecionarCoordenacao.value.toLowerCase() : "todos";
        const filtroTipo = selecionarTipo ? selecionarTipo.value.toUpperCase() : "SPLIT";

        const dadosFiltrados = dadosBrutos.filter(item => {
            const servico = (item.Servico || item.servico || item.Modalidade || "").toLowerCase();
            const tipo = (item.Tipo || item.tipo || "").toUpperCase();

            let combinarCoordenacao = true;
            if (filtroCoordenacao === "mensal") combinarCoordenacao = servico.includes("mensal");
            if (filtroCoordenacao === "sob demanda" || filtroCoordenacao === "sobdemanda") {
                combinarCoordenacao = servico.includes("sob") || servico.includes("demanda");
            }

            let combinarTipo = true;
            if (filtroTipo !== "TODOS") {
                combinarTipo = (tipo === filtroTipo);
            }

            return combinarCoordenacao && combinarTipo;
        });

        // Contagem para as 4 regiões obrigatórias
        const contagemRegioes = {
            "Espírito Santo": 0,
            "Estratégica": 0,
            "Interior": 0,
            "Metropolitana": 0
        };

        dadosFiltrados.forEach(item => {
            let regiao = item.Regiao || item.regiao || "";
            Object.keys(contagemRegioes).forEach(reg => {
                if (regiao.trim().toLowerCase() === reg.toLowerCase()) {
                    contagemRegioes[reg]++;
                }
            });
        });

        const contagemTipos = { "SPLIT": 0, "SELF": 0, "ACJ": 0, "CHILLER": 0, "FANCOIL": 0 };
        dadosBrutos.forEach(item => {
            const tipagem = (item.Tipo || item.tipo || "").toUpperCase();
            if (Object.hasOwn(contagemTipos, tipagem)) {
                contagemTipos[tipagem]++;
            }
        });

        // Renderiza Gráfico 1 (Regiões)
        if (instanciaGraficosRegioes) instanciaGraficosRegioes.destroy();

        instanciaGraficosRegioes = new Chart(ctxRegioes, {
            type: 'bar',
            data: {
                labels: Object.keys(contagemRegioes),
                datasets: [{
                    label: `Quantidade (${filtroTipo})`,
                    data: Object.values(contagemRegioes),
                    backgroundColor: coresTipos[filtroTipo] || '#660099',
                    borderColor: '#333',
                    borderWidth: 1
                }]
            },
            options: { // Corrigido de "option" para "options"
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { precision: 0 }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Equipamentos por Coordenação (Regiões)'
                    },
                    tooltip: {
                        enabled: true
                    }
                }
            }
        });

        // Renderiza Gráfico 2 (Doughnut de Tipos)
        const ctxSecundario = document.getElementById('segundoGrafico');
        if (ctxSecundario) {
            if (instanciaGraficoSecundario) instanciaGraficoSecundario.destroy();

            instanciaGraficoSecundario = new Chart(ctxSecundario, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(contagemTipos),
                    datasets: [{
                        data: Object.values(contagemTipos),
                        backgroundColor: [
                            coresTipos["SPLIT"],
                            coresTipos["SELF"],
                            coresTipos["ACJ"],
                            coresTipos["CHILLER"],
                            coresTipos["FANCOIL"]
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Panorama Geral por Tipo de Equipamento'
                        },
                        tooltip: {
                            enabled: true
                        }
                    }
                }
            });
        }
    }

    if (selecionarCoordenacao) selecionarCoordenacao.addEventListener("change", atualizarGraficos);
    if (selecionarTipo) selecionarTipo.addEventListener("change", atualizarGraficos);

    atualizarGraficos();
});