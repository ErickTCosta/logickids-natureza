export const CLIMATE_CATEGORIES = [
  'Condicional (SE / ENTÃO)',
  'Sequência Lógica',
  'Matemática Climática',
] as const

export type ClimateCategory = (typeof CLIMATE_CATEGORIES)[number]

export interface ClimateChallenge {
  category: ClimateCategory
  title: string
  question: string
  logicHint: string
  options: [string, string, string, string]
  correctIndex: number
  ecoFact: string
}

export const fallbackChallenges: ClimateChallenge[] = [
  {
    category: 'Condicional (SE / ENTÃO)',
    title: 'A luz da sala',
    question: 'Se não há ninguém na sala, qual atitude ajuda a economizar energia?',
    logicHint: 'Observe a condição: sala vazia significa que a luz não precisa ficar acesa.',
    options: ['Apagar a luz', 'Abrir a geladeira', 'Ligar mais lâmpadas', 'Deixar a luz acesa'],
    correctIndex: 0,
    ecoFact: 'Apagar as luzes quando elas não são necessárias evita o desperdício de energia.',
  },
  {
    category: 'Condicional (SE / ENTÃO)',
    title: 'Lixeira colorida',
    question: 'Se uma garrafa de plástico está limpa e vazia, em qual grupo ela deve ser colocada?',
    logicHint: 'Plástico é um material que pode ser separado para a reciclagem.',
    options: ['Recicláveis', 'Restos de comida', 'Rejeitos perigosos', 'Compostagem'],
    correctIndex: 0,
    ecoFact: 'Separar os resíduos facilita o trabalho das cooperativas e aumenta a reciclagem.',
  },
  {
    category: 'Sequência Lógica',
    title: 'Árvores crescendo',
    question: 'Uma equipe planta 2, depois 4, depois 6 árvores. Seguindo o padrão, quantas planta na próxima etapa?',
    logicHint: 'A sequência aumenta sempre pela mesma quantidade.',
    options: ['7 árvores', '8 árvores', '10 árvores', '12 árvores'],
    correctIndex: 1,
    ecoFact: 'Árvores ajudam a retirar gás carbônico da atmosfera e deixam as cidades mais frescas.',
  },
  {
    category: 'Sequência Lógica',
    title: 'Gotas economizadas',
    question: 'Lia economiza 1, 3, 5 e 7 copos de água. Quantos copos ela economizará na próxima semana?',
    logicHint: 'Conte de quanto em quanto os números estão aumentando.',
    options: ['8 copos', '9 copos', '10 copos', '11 copos'],
    correctIndex: 1,
    ecoFact: 'Fechar a torneira enquanto escovamos os dentes é uma maneira simples de poupar água.',
  },
  {
    category: 'Matemática Climática',
    title: 'Horta da escola',
    question: 'A horta tem 3 canteiros com 4 mudas em cada um. Quantas mudas foram plantadas?',
    logicHint: 'Quando grupos iguais aparecem, podemos multiplicar.',
    options: ['7 mudas', '10 mudas', '12 mudas', '14 mudas'],
    correctIndex: 2,
    ecoFact: 'Hortas escolares aproximam as crianças dos alimentos e podem reduzir o desperdício.',
  },
  {
    category: 'Matemática Climática',
    title: 'Painéis solares',
    question: 'Cada painel solar produz 5 pontos de energia. Com 4 painéis, quantos pontos são produzidos?',
    logicHint: 'Some 5 quatro vezes ou faça 5 vezes 4.',
    options: ['9 pontos', '15 pontos', '20 pontos', '25 pontos'],
    correctIndex: 2,
    ecoFact: 'A energia solar aproveita a luz do Sol, uma fonte renovável e limpa.',
  },
]

export function getFallbackChallenge(category?: ClimateCategory): ClimateChallenge {
  const options = category
    ? fallbackChallenges.filter((challenge) => challenge.category === category)
    : fallbackChallenges

  return options[Math.floor(Math.random() * options.length)] ?? fallbackChallenges[0]
}
