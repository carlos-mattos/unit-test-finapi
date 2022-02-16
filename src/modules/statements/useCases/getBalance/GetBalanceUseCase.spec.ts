import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get balance", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should get user balance", async () => {
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

    await createStatementUseCase.execute(deposit);

    const balance = await getBalanceUseCase.execute({
      user_id: String(userCreated.id),
    });

    expect(balance.balance).toBe(100);
    expect(balance.statement).toHaveLength(1);
    expect(balance.statement[0]).toBeInstanceOf(Statement);
  });

  it("should not retrieve data if user was not found", async () => {
    await expect(
      getBalanceUseCase.execute({ user_id: "false_id" })
    ).rejects.toEqual(new GetBalanceError());
  });
});
