import { Test, TestingModule } from '@nestjs/testing';
import { EightyGService } from './eighty-g.service';

describe('EightyGService', () => {
  let service: EightyGService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EightyGService],
    }).compile();

    service = module.get<EightyGService>(EightyGService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
