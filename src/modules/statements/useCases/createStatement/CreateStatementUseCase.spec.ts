import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create a statement (deposit or withdraw)", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should create a statement type deposit", async () => {
    const user: ICreateUserDTO = {
      name: "John Doe",
      email: "re@zep.ws",
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

    expect(statementCreated).toBeInstanceOf(Statement);
    expect(statementCreated).toHaveProperty("id");
  });

  it("should create a statement type withdraw", async () => {
    const user: ICreateUserDTO = {
      name: "Luella Tyler",
      email: "ge@ba.us",
      password: "123456",
    };

    const userCreated = await createUserUseCase.execute(user);

    const deposit: ICreateStatementDTO = {
      amount: 100,
      type: OperationType.DEPOSIT,
      description: "deposit test",
      user_id: userCreated.id || "",
    };

    await createStatementUseCase.execute(deposit);

    const withdraw: ICreateStatementDTO = {
      amount: 50,
      type: OperationType.WITHDRAW,
      description: "withdraw test",
      user_id: userCreated.id || "",
    };

    const statementCreated = await createStatementUseCase.execute(withdraw);

    expect(statementCreated).toBeInstanceOf(Statement);
    expect(statementCreated).toHaveProperty("id");
  });

  it("should not allow statement if did not find user", async () => {
    const deposit: ICreateStatementDTO = {
      amount: 100,
      type: OperationType.DEPOSIT,
      description: "deposit test",
      user_id: "false-id",
    };

    await expect(createStatementUseCase.execute(deposit)).rejects.toEqual(
      new CreateStatementError.UserNotFound()
    );
  });

  it("should not allow a withdraw if amount if lower than balance", async () => {
    const user: ICreateUserDTO = {
      name: "Samuel Weber",
      email: "beca@paecjic.to",
      password: "123456",
    };

    const userCreated = await createUserUseCase.execute(user);

    const withdraw: ICreateStatementDTO = {
      amount: 50,
      type: OperationType.WITHDRAW,
      description: "withdraw test",
      user_id: userCreated.id || "",
    };

    await expect(createStatementUseCase.execute(withdraw)).rejects.toEqual(
      new CreateStatementError.InsufficientFunds()
    );
  });
});
