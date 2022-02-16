import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should create a new user", async () => {
    const user: ICreateUserDTO = {
      email: "luomo@dibwaw.se",
      name: "Isaiah Schmidt",
      password: "123456",
    };

    const userCreated = await createUserUseCase.execute(user);

    expect(userCreated).toBeInstanceOf(User);
    expect(userCreated).toHaveProperty("id");
  });

  it("should not create a new user when already has one with email passed", async () => {
    const user1: ICreateUserDTO = {
      email: "luomo@dibwaw.se",
      name: "Isaiah Schmidt",
      password: "480891",
    };

    const user2: ICreateUserDTO = {
      email: "luomo@dibwaw.se",
      name: "Isaiah Schmidt",
      password: "566641",
    };

    await createUserUseCase.execute(user1);

    await expect(createUserUseCase.execute(user2)).rejects.toEqual(
      new CreateUserError()
    );
  });
});
