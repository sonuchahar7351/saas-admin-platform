import { Test, TestingModule } from '@nestjs/testing';
import { EightyGController } from './eighty-g.controller';
import { EightyGService } from './eighty-g.service';

describe('EightyGController', () => {
  let controller: EightyGController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EightyGController],
      providers: [EightyGService],
    }).compile();

    controller = module.get<EightyGController>(EightyGController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
