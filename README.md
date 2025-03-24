# Profitly - Gestão de Projetos e Lucratividade 📊💰

**Profitly[text](https://profitly.onrender.com/)** é uma plataforma web para gestão de projetos, com foco na análise da lucratividade. O sistema permite cadastrar projetos, acompanhar receitas e despesas e calcular automaticamente o lucro obtido.

## 🚀 Tecnologias Utilizadas

- **Frontend:** Vite, React, Tailwind, Zod, Axios, FontAwesome, Qs e Hookform
- **Backend:** Node.js, Prisma, Zod e Axios
- **Banco de Dados:** PostgreSQL
- **Autenticação:** JWT
- **Versionamento:** Git & GitHub

## ⚙️ Funcionalidades

✔️ Cadastro e gerenciamento de projetos  
✔️ Registro de receitas e despesas  
✔️ Cálculo automático da lucratividade  
✔️ Relatórios e gráficos financeiros  
✔️ Controle de usuários e permissões

## 📌 Como Executar o Projeto

### 1️⃣ Clonar o repositório

```sh
git clone https://github.com/carlos-ferreira-coder/profitly.git
cd Profitly

### 2️⃣ Configurar o ambiente
cd Frontend
npm install
cd ..
cd Backend
npm install
cd ..

### 3️⃣ Configurar as variáveis de ambiente
Crie um arquivo .env na raiz do Backend e adicione as configurações
'''
  CORS_ORIGIN=dominio_do_frontend
  CORS_METHODS="GET,POST,PUT,PATCH,DELETE"
  CORS_CREDENTIALS="true"
  DOMAIN=dominio_do_backend
  JWT_SECRET=chave_secreta
  DATABASE_URL=url_do_banco_de_dados
'''

### 4️⃣ Executar o projeto
cd Frontend
npm run dev
cd ..
cd Backend
npm prisma db seed
npm run dev

🛠️ Próximos Passos
- 🤖 **Inserir IA** para prever possíveis prejuízos em tarefas com base em padrões financeiros e operacionais.
- ⏰ **Implementação de alertas** para notificar sobre prazos de entrega e riscos financeiros iminentes.
- 🔄 **Controle preventivo de estouros** para evitar gastos excessivos e manter o orçamento equilibrado.

🤝 Contribuição
Sinta-se à vontade para contribuir com melhorias! Para isso:
Faça um fork do repositório
Crie uma branch (git checkout -b minha-feature)
Faça as alterações e commit (git commit -m "Minha melhoria")
Envie um pull request
```
