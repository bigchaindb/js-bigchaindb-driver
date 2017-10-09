import { TestBed, inject } from '@angular/core/testing';

import { BdbService } from './bdb.service';

describe('BdbService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BdbService]
    });
  });

  it('should be created', inject([BdbService], (service: BdbService) => {
    expect(service).toBeTruthy();
  }));
});
