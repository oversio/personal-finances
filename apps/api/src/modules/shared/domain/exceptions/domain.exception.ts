export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidEntityIdError extends DomainException {
  constructor(id: string) {
    super(`Invalid entity ID: ${id}`);
  }
}

export class EntityNotFoundError extends DomainException {
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found`);
  }
}

export class EntityAlreadyExistsError extends DomainException {
  constructor(entity: string, field: string, value: string) {
    super(`${entity} with ${field} "${value}" already exists`);
  }
}
