import { Test, TestingModule } from '@nestjs/testing';
import { CafesController } from './cafes.controller';
import { CafesService } from './cafes.service';

describe('CafesController', () => {
  let controller: CafesController;
  let cafesService: jest.Mocked<
    Pick<CafesService, 'listCafes' | 'getCafeBySlug' | 'getMenu' | 'getReviews'>
  >;

  beforeEach(async () => {
    cafesService = {
      listCafes: jest.fn(),
      getCafeBySlug: jest.fn(),
      getMenu: jest.fn(),
      getReviews: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CafesController],
      providers: [{ provide: CafesService, useValue: cafesService }],
    }).compile();

    controller = module.get<CafesController>(CafesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list cafes with the validated query', async () => {
    const query = { page: 1, limit: 20, order: 'rating' as const };
    cafesService.listCafes.mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });

    const result = await controller.list(query);
    expect(result.meta.total).toBe(0);
    expect(cafesService.listCafes).toHaveBeenCalledWith(query);
  });

  it('should wrap the detail, menu and reviews in data envelopes', async () => {
    cafesService.getCafeBySlug.mockResolvedValue({ id: 'shop-1' } as never);
    cafesService.getMenu.mockResolvedValue([]);
    cafesService.getReviews.mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });

    const detail = await controller.getBySlug({ slug: 'alfa' });
    expect(detail.data.id).toBe('shop-1');

    const menu = await controller.getMenu({ slug: 'alfa' });
    expect(menu.data).toEqual([]);

    const reviews = await controller.getReviews(
      { slug: 'alfa' },
      { page: 1, limit: 20 },
    );
    expect(reviews.meta.total).toBe(0);

    expect(cafesService.getCafeBySlug).toHaveBeenCalledWith('alfa');
    expect(cafesService.getMenu).toHaveBeenCalledWith('alfa');
    expect(cafesService.getReviews).toHaveBeenCalledWith('alfa', {
      page: 1,
      limit: 20,
    });
  });
});
