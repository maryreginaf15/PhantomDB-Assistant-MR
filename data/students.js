const studentsData = [
    {
        id: 1,
        nome: "Ana Silva",
        idade: 18,
        frequencia_faltas: 5,
        onde_mora: "São Paulo, SP",
        cpf: "123.456.789-00",
        ano_nascimento: 2008,
        ano_matricula: 2026,
        data_inicio: "2024-02-15",
        data_termino: "",
        status: "Ativo"
    },
    {
        id: 2,
        nome: "Bruno Santos",
        idade: 19,
        frequencia_faltas: 30,
        onde_mora: "Rio de Janeiro, RJ",
        cpf: "234.567.890-11",
        ano_nascimento: 2007,
        ano_matricula: 2026,
        data_inicio: "2024-02-15",
        data_termino: "",
        status: "Inativo"
    },
    {
        id: 3,
        nome: "Carla Oliveira",
        idade: 20,
        frequencia_faltas: 2,
        onde_mora: "Belo Horizonte, MG",
        cpf: "345.678.901-22",
        ano_nascimento: 2006,
        ano_matricula: 2025,
        data_inicio: "2023-02-15",
        data_termino: "2025-12-20",
        status: "Inativo"
    },
    {
        id: 4,
        nome: "Diego Souza",
        idade: 18,
        frequencia_faltas: 8,
        onde_mora: "Curitiba, PR",
        cpf: "456.789.012-33",
        ano_nascimento: 2008,
        ano_matricula: 2026,
        data_inicio: "2024-02-15",
        data_termino: "",
        status: "Ativo"
    },
    {
        id: 5,
        nome: "Elena Martins",
        idade: 21,
        frequencia_faltas: 0,
        onde_mora: "Porto Alegre, RS",
        cpf: "567.890.123-44",
        ano_nascimento: 2005,
        ano_matricula: 2025,
        data_inicio: "2023-02-15",
        data_termino: "2025-12-20",
        status: "Inativo"
    }
];

function calculateStatus(anoMatricula, faltas, dataTermino) {
    if (dataTermino && dataTermino !== "") return "Inativo (Finalizado)";
    if (anoMatricula <= 2025) return "Inativo (Formado)";
    if (faltas > 20) return "Inativo (Faltas)";
    return "Ativo";
}

export { studentsData, calculateStatus };
