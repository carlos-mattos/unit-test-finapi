import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Authentication", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
  });

  it("should authenticate an user", async () => {
    const user: ICreateUserDTO = {
      email: "la@sen.ir",
      name: "Antonio Bradley",
      password: "123456",
    };

    await createUserUseCase.execute(user);

    const response = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(response).toHaveProperty("token");
  });

  it("should not authenticate a non-existent user", async () => {
    await expect(
      authenticateUserUseCase.execute({
        email: "false@false.com.br",
        password: "false",
      })
    ).rejects.toEqual(new IncorrectEmailOrPasswordError());
  });

  it("should not authenticate a user with a wrong password", async () => {
    const user: ICreateUserDTO = {
      email: "dev@kop.na",
      name: "Jonathan Ferguson",
      password: "123456",
    };

    await createUserUseCase.execute(user);

    await expect(
      authenticateUserUseCase.execute({
        email: user.email,
        password: "false",
      })
    ).rejects.toEqual(new IncorrectEmailOrPasswordError());
  });
});
