import { TestBed } from '@angular/core/testing';

import { FlareJsonService } from './flare-json.service';

describe('FlareJsonService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FlareJsonService = TestBed.get(FlareJsonService);
    expect(service).toBeTruthy();
  });
});
