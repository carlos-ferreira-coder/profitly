import { prisma } from '@/server.js'
import bcrypt from 'bcrypt'

const seed = async () => {
  const salt = await bcrypt.genSalt(10)

  await prisma.auth.createMany({
    data: [
      {
        id: 0,
        uuid: '6babc75d-30ea-4d49-8b7d-3fffb2ddbcec',
        name: 'Administrador',
        admin: true,
        project: true,
        personal: true,
        financial: true,
      },
      {
        id: 1,
        uuid: 'a42d15c4-6721-4b15-84de-b5fa8ab86bac',
        name: 'Sócio',
        admin: true,
        project: true,
        personal: false,
        financial: true,
      },
      {
        id: 2,
        uuid: '011ea0b9-786c-4833-b8a9-f060b604f242',
        name: 'Consultor',
        admin: false,
        project: true,
        personal: false,
        financial: true,
      },
      {
        id: 3,
        uuid: '60e3d518-e670-4781-9762-63cc0c2888b6',
        name: 'RH',
        admin: false,
        project: false,
        personal: true,
        financial: true,
      },
      {
        id: 4,
        uuid: '462ac957-2f54-4222-af77-55742fd31d44',
        name: 'Financeiro',
        admin: false,
        project: false,
        personal: false,
        financial: true,
      },
      {
        id: 5,
        uuid: 'f8eb44b1-cb47-4c47-a518-aa0d081c856f',
        name: 'Estagiário',
        admin: false,
        project: false,
        personal: false,
        financial: false,
      },
    ],
    skipDuplicates: true,
  })
  await prisma.status.createMany({
    data: [
      {
        id: 1,
        uuid: 'e823a05a-a964-4b91-a463-1658149f2ae1',
        name: 'Planejamento',
        description: 'Está em fase de definição e planejamento',
        priority: 5,
      },
      {
        id: 2,
        uuid: '516140dc-8c1d-48a5-909e-b7368c17b733',
        name: 'Negociação',
        description: 'Está em fase orçamento e negociação',
        priority: 6,
      },
      {
        id: 3,
        uuid: '9a11ce5e-319a-4c57-9af4-625f5f7f63c7',
        name: 'Aguardando Aprovação',
        description: 'O projeto aguarda aprovação antes de iniciar',
        priority: 7,
      },
      {
        id: 4,
        uuid: '3c1fed0d-2157-4ff9-953a-a6bb92a3114e',
        name: 'Não Iniciado',
        description: 'O projeto foi aprovado, mas ainda não começou',
        priority: 4,
      },
      {
        id: 5,
        uuid: '0c857486-83a1-4ef8-aaaf-efbc4281fa53',
        name: 'Em Andamento',
        description: 'O projeto está em execução',
        priority: 3,
      },
      {
        id: 6,
        uuid: '07d6fbc3-a23c-4a33-9b13-6ec7a921319f',
        name: 'Suspenso',
        description: 'O projeto foi temporariamente interrompido',
        priority: 1,
      },
      {
        id: 7,
        uuid: '6dac5df4-8c87-49ba-896b-cca432e9a8a0',
        name: 'Atrasado',
        description: 'O projeto está em execução, mas atrasado em relação ao cronograma',
        priority: 2,
      },
      {
        id: 8,
        uuid: '4699a2bc-49de-44d7-ac10-e020ddd9996b',
        name: 'Aguardando Recursos',
        description: 'O projeto não pode continuar ou começar porque está aguardando recursos',
        priority: 3,
      },
      {
        id: 9,
        uuid: '8c201566-40a8-45a3-bb79-37bfe37581c3',
        name: 'Concluído',
        description: 'O projeto foi concluído com sucesso',
        priority: 9,
      },
      {
        id: 10,
        uuid: 'f4cce4d9-40df-48f8-bfc2-221c5062b70b',
        name: 'Cancelado',
        description: 'O projeto foi encerrado antes de ser concluído',
        priority: 10,
      },
      {
        id: 11,
        uuid: '7cbfdab1-a556-43f2-bf61-d0b564d78e78',
        name: 'Encerrado',
        description: 'O projeto foi oficialmente fechado',
        priority: 8,
      },
    ],
    skipDuplicates: true,
  })
  await prisma.user.createMany({
    data: [
      {
        id: 0,
        uuid: 'd87538d0-3f38-4edf-b41d-a307b797a189',
        username: 'Admin',
        password: await bcrypt.hash('abcd@1234', salt),
        active: true,
        photo: null,
        hourlyRate: null,
        authUuid: '6babc75d-30ea-4d49-8b7d-3fffb2ddbcec',
      },
      {
        id: 1,
        uuid: '3b116097-581d-4af2-b0d6-5f085adf26e1',
        username: 'johndoe',
        password: await bcrypt.hash('abcd@1234', salt),
        active: true,
        photo: null,
        hourlyRate: 500,
        authUuid: 'a42d15c4-6721-4b15-84de-b5fa8ab86bac',
      },
      {
        id: 2,
        uuid: '47d56b1b-a557-47a9-81c5-2b5ee179912d',
        username: 'alicebrown',
        password: await bcrypt.hash('abcd@1234', salt),
        active: true,
        photo: null,
        hourlyRate: 300,
        authUuid: '011ea0b9-786c-4833-b8a9-f060b604f242',
      },
      {
        id: 3,
        uuid: '2dec250c-3d0b-41b4-9385-853d9d20d9e8',
        username: 'dianablue',
        password: await bcrypt.hash('abcd@1234', salt),
        active: true,
        photo: null,
        hourlyRate: null,
        authUuid: '60e3d518-e670-4781-9762-63cc0c2888b6',
      },
      {
        id: 4,
        uuid: '49ef946a-2ad5-4c09-a1ec-7cddc17c51ee',
        username: 'charliegreen',
        password: await bcrypt.hash('abcd@1234', salt),
        active: true,
        photo: null,
        hourlyRate: null,
        authUuid: '462ac957-2f54-4222-af77-55742fd31d44',
      },
      {
        id: 5,
        uuid: 'a01c243b-a5d5-40af-b571-1342b272943e',
        username: 'janesmith',
        password: await bcrypt.hash('abcd@1234', salt),
        active: true,
        photo: null,
        hourlyRate: 10.5,
        authUuid: 'f8eb44b1-cb47-4c47-a518-aa0d081c856f',
      },
    ],
    skipDuplicates: true,
  })
  await prisma.client.createMany({
    data: [
      {
        id: 6,
        uuid: 'd653ee18-3fbe-4137-9b5b-16e4cb1a12fd',
        active: true,
        personId: null,
        enterpriseId: 6,
      },
      {
        id: 7,
        uuid: '78090c61-946d-46aa-808a-7cf3b81f2728',
        active: true,
        personId: null,
        enterpriseId: 7,
      },
      {
        id: 8,
        uuid: 'e2354148-83a8-440d-addb-4c4ee0caf5a2',
        active: true,
        personId: null,
        enterpriseId: 8,
      },
      {
        id: 10,
        uuid: '23377d65-a3f8-4037-8132-bf3da8de85d1',
        active: true,
        personId: null,
        enterpriseId: 10,
      },
      {
        id: 12,
        uuid: '3aa41fb2-998e-4077-847e-a1cb7b378450',
        active: false,
        personId: 12,
        enterpriseId: null,
      },
      {
        id: 13,
        uuid: 'f86db89b-921d-4161-91e7-a46ab23d1891',
        active: true,
        personId: 13,
        enterpriseId: null,
      },
    ],
    skipDuplicates: true,
  })
  await prisma.supplier.createMany({
    data: [
      {
        id: 6,
        uuid: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        active: true,
        personId: null,
        enterpriseId: 6,
      },
      {
        id: 9,
        uuid: '9a27d8a1-3c0d-4f09-9d78-6b0e5e6a08b1',
        active: false,
        personId: null,
        enterpriseId: 9,
      },
      {
        id: 11,
        uuid: '3e1f4b92-8e44-4e3d-91b5-2b96d5a27f61',
        active: true,
        personId: 11,
        enterpriseId: null,
      },
    ],
    skipDuplicates: true,
  })
  await prisma.enterprise.createMany({
    data: [
      {
        id: 6,
        cnpj: '14.725.836/0001-01',
        fantasy: 'Alpha',
      },
      {
        id: 7,
        cnpj: '78.912.345/0001-02',
        fantasy: 'Delta',
      },
      {
        id: 8,
        cnpj: '36.985.214/0002-02',
        fantasy: 'Epsilon',
      },
      {
        id: 9,
        cnpj: '75.315.948/0001-03',
        fantasy: 'Gamma',
      },
      {
        id: 10,
        cnpj: '95.135.762/0002-02',
        fantasy: 'Lambda',
      },
    ],
    skipDuplicates: true,
  })
  await prisma.person.createMany({
    data: [
      {
        id: 0,
        cpf: '000.000.000-00',
      },
      {
        id: 1,
        cpf: '123.456.789-10',
      },
      {
        id: 2,
        cpf: '987.654.321-00',
      },
      {
        id: 3,
        cpf: '456.789.123-99',
      },
      {
        id: 4,
        cpf: '321.654.987-88',
      },
      {
        id: 5,
        cpf: '654.321.987-77',
      },
      {
        id: 11,
        cpf: '123.456.789-00',
      },
      {
        id: 12,
        cpf: '987.654.321-99',
      },
      {
        id: 13,
        cpf: '000.000.000-99',
      },
    ],
    skipDuplicates: true,
  })
  await prisma.entity.createMany({
    data: [
      {
        id: 0,
        name: 'Administrador',
        email: 'admin@profitly.com',
        phone: null,
        address: null,
      },
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '(99) 9 9999-9999',
        address: '123 Elm Street, Springfield, IL, 62704, USA',
      },
      {
        id: 2,
        name: 'Alice Brown',
        email: 'alice@example.com',
        phone: '(00) 0 0000-0000',
        address: '456 Oak Avenue, Toronto, ON, M4B 1B4, Canada',
      },
      {
        id: 3,
        name: 'Diana Blue',
        email: 'diana@example.com',
        phone: null,
        address: null,
      },
      {
        id: 4,
        name: 'Charlie Green',
        email: 'charlie@example.com',
        phone: '(88) 8 8888-8888',
        address: '789 Pine Lane, Sydney, NSW, 2000, Australia',
      },
      {
        id: 5,
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: null,
        address: '303 Cedar Boulevard, Tokyo, 100-0001, Japan',
      },
      {
        id: 6,
        name: 'Alpha Inc',
        email: 'contact@alpha.com',
        phone: '(99) 9 9999-9999',
        address: '456 Oak Avenue, Toronto, ON, M4B 1B4, Canada',
      },
      {
        id: 7,
        name: 'Delta Ltd',
        email: 'contact@delta.com',
        phone: '(00) 0 0000-0000',
        address: '123 Elm Street, Springfield, IL, 62704, USA',
      },
      {
        id: 8,
        name: 'Epsilon LLC',
        email: 'contact@epsilon.com',
        phone: null,
        address: null,
      },
      {
        id: 9,
        name: 'Gamma Co',
        email: 'contact@gamma.com',
        phone: '(88) 8 8888-8888',
        address: '789 Pine Lane, Sydney, NSW, 2000, Australia',
      },
      {
        id: 10,
        name: 'Lambda SA',
        email: 'contact@lambda.com',
        phone: null,
        address: '404 Walnut Way, Berlin, 10115, Germany',
      },
      {
        id: 11,
        name: 'Teta',
        email: 'contact@teta.com',
        phone: '(99) 9 9999-9999',
        address: null,
      },
      {
        id: 12,
        name: 'Ômega',
        email: 'contact@omega.com',
        phone: '(00) 0 0000-0000',
        address: '101 Maple Road, London, SW1A 1AA, UK',
      },
      {
        id: 13,
        name: 'Sigma',
        email: 'contact@sigma.com',
        phone: null,
        address: '303 Cedar Boulevard, Tokyo, 100-0001, Japan',
      },
    ],
    skipDuplicates: true,
  })
  await prisma.project.createMany({
    data: [
      {
        id: 1,
        uuid: 'b6a8f5e3-2d4f-4c6b-91a1-5e9d7c3f12b8',
        name: 'Delta',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Integer tincidunt, urna eu posuere feugiat, nulla ex sagittis justo, at feugiat justo turpis nec sapien. Fusce volutpat, libero at vestibulum ultricies, est augue volutpat mauris, non consectetur erat eros id libero.',
        register: '2025-02-28T14:23:45Z',
        active: true,
        userUuid: null,
        clientUuid: 'e2354148-83a8-440d-addb-4c4ee0caf5a2',
        statusUuid: 'e823a05a-a964-4b91-a463-1658149f2ae1',
        budgetUuid: 'd1e2a3b4-5c6d-7e8f-9012-3456789abcdef',
      },
      {
        id: 2,
        uuid: '7c3e9a2d-8b45-4f1a-b670-2f1d8e7c5a39',
        name: 'Ômega',
        description:
          'Suspendisse potenti. Phasellus non metus ut metus vulputate tincidunt. Nam nec nulla eget justo facilisis fermentum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Aliquam erat volutpat. Proin blandit tellus in ante vehicula, in sollicitudin lacus aliquet.',
        register: '2024-11-15T08:37:12Z',
        active: true,
        userUuid: '47d56b1b-a557-47a9-81c5-2b5ee179912d',
        clientUuid: 'd653ee18-3fbe-4137-9b5b-16e4cb1a12fd',
        statusUuid: '0c857486-83a1-4ef8-aaaf-efbc4281fa53',
        budgetUuid: 'f9a4b7c2-6d3e-5f1a-9b08-7c2e5d4a3b6f',
      },
    ],
  })
  await prisma.budget.createMany({
    data: [
      {
        id: 1,
        uuid: 'd1e2a3b4-5c6d-7e8f-9012-3456789abcdef',
        register: '2025-02-28T14:23:45Z',
      },
      {
        id: 2,
        uuid: 'f9a4b7c2-6d3e-5f1a-9b08-7c2e5d4a3b6f',
        register: '2024-11-15T08:37:12Z',
      },
    ],
  })
}

seed().then(() => {
  console.log('Database seeded!')
  prisma.$disconnect()
})
