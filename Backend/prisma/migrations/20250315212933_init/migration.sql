-- CreateTable
CREATE TABLE "Entity" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,

    CONSTRAINT "Entity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" SERIAL NOT NULL,
    "cpf" TEXT NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enterprise" (
    "id" SERIAL NOT NULL,
    "cnpj" TEXT NOT NULL,
    "fantasy" TEXT NOT NULL,

    CONSTRAINT "Enterprise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "active" BOOLEAN NOT NULL,
    "personId" INTEGER,
    "enterpriseId" INTEGER,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "active" BOOLEAN NOT NULL,
    "personId" INTEGER,
    "enterpriseId" INTEGER,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "photo" TEXT,
    "hourly_rate" DECIMAL(15,2),
    "auth_uuid" UUID NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auth" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "admin" BOOLEAN NOT NULL,
    "project" BOOLEAN NOT NULL,
    "personal" BOOLEAN NOT NULL,
    "financial" BOOLEAN NOT NULL,

    CONSTRAINT "Auth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Status" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "register" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL,
    "user_uuid" UUID,
    "client_uuid" UUID NOT NULL,
    "status_uuid" UUID NOT NULL,
    "budget_uuid" UUID NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "register" TIMESTAMP(3),

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "begin_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "revenue" DECIMAL(15,2) NOT NULL,
    "status_uuid" UUID NOT NULL,
    "project_uuid" UUID NOT NULL,
    "user_uuid" UUID,
    "budget_uuid" UUID,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskExpense" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "TaskExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskActivity" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "hourly_rate" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "TaskActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Done" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "register" TIMESTAMP(3) NOT NULL,
    "taskId" INTEGER NOT NULL,
    "user_uuid" UUID NOT NULL,

    CONSTRAINT "Done_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoneActivity" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "begin_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "hourly_rate" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "DoneActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoneExpense" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "supplier_uuid" UUID NOT NULL,

    CONSTRAINT "DoneExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "register" TIMESTAMP(3) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "user_uuid" UUID NOT NULL,
    "project_uuid" UUID,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "supplier_uuid" UUID NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Income" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "client_uuid" UUID NOT NULL,

    CONSTRAINT "Income_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "client_uuid" UUID,
    "supplier_uuid" UUID,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "installment" DECIMAL(15,2) NOT NULL,
    "months" INTEGER NOT NULL,
    "supplier_uuid" UUID NOT NULL,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Entity_email_key" ON "Entity"("email");

-- CreateIndex
CREATE INDEX "Entity_email_idx" ON "Entity"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Person_cpf_key" ON "Person"("cpf");

-- CreateIndex
CREATE INDEX "Person_cpf_idx" ON "Person"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Enterprise_cnpj_key" ON "Enterprise"("cnpj");

-- CreateIndex
CREATE INDEX "Enterprise_cnpj_idx" ON "Enterprise"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Client_uuid_key" ON "Client"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Client_personId_key" ON "Client"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_enterpriseId_key" ON "Client"("enterpriseId");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_uuid_key" ON "Supplier"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_personId_key" ON "Supplier"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_enterpriseId_key" ON "Supplier"("enterpriseId");

-- CreateIndex
CREATE UNIQUE INDEX "User_uuid_key" ON "User"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Auth_uuid_key" ON "Auth"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Status_uuid_key" ON "Status"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Project_uuid_key" ON "Project"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Project_budget_uuid_key" ON "Project"("budget_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Budget_uuid_key" ON "Budget"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Task_id_key" ON "Task"("id");

-- CreateIndex
CREATE UNIQUE INDEX "TaskExpense_uuid_key" ON "TaskExpense"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "TaskActivity_uuid_key" ON "TaskActivity"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Done_id_key" ON "Done"("id");

-- CreateIndex
CREATE UNIQUE INDEX "DoneActivity_uuid_key" ON "DoneActivity"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "DoneExpense_uuid_key" ON "DoneExpense"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_id_key" ON "Transaction"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Expense_uuid_key" ON "Expense"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Income_uuid_key" ON "Income"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Refund_uuid_key" ON "Refund"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Loan_uuid_key" ON "Loan"("uuid");

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_id_fkey" FOREIGN KEY ("id") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enterprise" ADD CONSTRAINT "Enterprise_id_fkey" FOREIGN KEY ("id") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_id_fkey" FOREIGN KEY ("id") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_auth_uuid_fkey" FOREIGN KEY ("auth_uuid") REFERENCES "Auth"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "User"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_client_uuid_fkey" FOREIGN KEY ("client_uuid") REFERENCES "Client"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_status_uuid_fkey" FOREIGN KEY ("status_uuid") REFERENCES "Status"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_budget_uuid_fkey" FOREIGN KEY ("budget_uuid") REFERENCES "Budget"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_status_uuid_fkey" FOREIGN KEY ("status_uuid") REFERENCES "Status"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_project_uuid_fkey" FOREIGN KEY ("project_uuid") REFERENCES "Project"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "User"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_budget_uuid_fkey" FOREIGN KEY ("budget_uuid") REFERENCES "Budget"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskExpense" ADD CONSTRAINT "TaskExpense_id_fkey" FOREIGN KEY ("id") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskActivity" ADD CONSTRAINT "TaskActivity_id_fkey" FOREIGN KEY ("id") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Done" ADD CONSTRAINT "Done_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "User"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Done" ADD CONSTRAINT "Done_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoneActivity" ADD CONSTRAINT "DoneActivity_id_fkey" FOREIGN KEY ("id") REFERENCES "Done"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoneExpense" ADD CONSTRAINT "DoneExpense_supplier_uuid_fkey" FOREIGN KEY ("supplier_uuid") REFERENCES "Supplier"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoneExpense" ADD CONSTRAINT "DoneExpense_id_fkey" FOREIGN KEY ("id") REFERENCES "Done"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "User"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_project_uuid_fkey" FOREIGN KEY ("project_uuid") REFERENCES "Project"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_supplier_uuid_fkey" FOREIGN KEY ("supplier_uuid") REFERENCES "Supplier"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_id_fkey" FOREIGN KEY ("id") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Income" ADD CONSTRAINT "Income_client_uuid_fkey" FOREIGN KEY ("client_uuid") REFERENCES "Client"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Income" ADD CONSTRAINT "Income_id_fkey" FOREIGN KEY ("id") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_client_uuid_fkey" FOREIGN KEY ("client_uuid") REFERENCES "Client"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_supplier_uuid_fkey" FOREIGN KEY ("supplier_uuid") REFERENCES "Supplier"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_id_fkey" FOREIGN KEY ("id") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_supplier_uuid_fkey" FOREIGN KEY ("supplier_uuid") REFERENCES "Supplier"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_id_fkey" FOREIGN KEY ("id") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
