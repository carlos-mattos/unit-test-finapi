import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should retrieve a statement given it id and user id", async () => {
    const user: ICreateUserDTO = {
      name: "Chase Parker",
      email: "muva@erolu.al",
      password: "123456",
    };

    const userCreated = await createUserUseCase.execute(user);

    const deposit: ICreateStatementDTO = {
      amount: 100,
      type: OperationType.DEPOSIT,
      description: "deposit test",
      user_id: userCreated.id || "",
    };

    const statementCreated = await createStatementUseCase.execute(deposit);

    const statement = await getStatementOperationUseCase.execute({
      statement_id: String(statementCreated.id),
      user_id: String(userCreated.id),
    });

    expect(statement.id).toBe(statementCreated.id);
    expect(statement.user_id).toBe(userCreated.id);
  });

  it("should not retrieve a statement if user was not found", async () => {
    const user: ICreateUserDTO = {
      name: "Chase Parker",
      email: "muva@erolu.al",
      password: "123456",
    };

    const userCreated = await createUserUseCase.execute(user);

    const deposit: ICreateStatementDTO = {
      amount: 100,
      type: OperationType.DEPOSIT,
      description: "deposit test",
      user_id: userCreated.id || "",
    };

    const statementCreated = await createStatementUseCase.execute(deposit);

    await expect(
      getStatementOperationUseCase.execute({
        statement_id: String(statementCreated.id),
        user_id: "false_id",
      })
    ).rejects.toEqual(new GetStatementOperationError.UserNotFound());
  });

  it("should not retrieve a statement if statement was not found", async () => {
    const user: ICreateUserDTO = {
      name: "Chase Parker",
      email: "muva@erolu.al",
      password: "123456",
    };

    const userCreated = await createUserUseCase.execute(user);

    await expect(
      getStatementOperationUseCase.execute({
        statement_id: "false_id",
        user_id: String(userCreated.id),
      })
    ).rejects.toEqual(new GetStatementOperationError.StatementNotFound());
  });
});