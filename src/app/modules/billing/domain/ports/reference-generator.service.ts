export abstract class ReferenceGeneratorService {
  abstract generate(): Promise<string>;
}
