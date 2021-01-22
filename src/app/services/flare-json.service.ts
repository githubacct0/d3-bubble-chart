import { Injectable } from '@angular/core';
import { D3, D3Service } from 'd3-ng2-service';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';
import { HierarchyNode, HierarchyPointNode } from 'd3-hierarchy';
// import { map } from 'rxjs/operators';
import { NodeModel } from '../models/node.model';

@Injectable({
  providedIn: 'root',
})
export class FlareJsonService {
  private d3: D3;
  constructor(private http: Http, private d3Service: D3Service) {
    this.d3 = d3Service.getD3();
  }

  getRoot(): Observable<any> {
    return this.http.get('./assets/data.json');
  }
  
  getTest(): Observable<any> {
    return this.http.get('./assets/testData.json');
  }

  parsToD3Hierarchy(data: any) {
    return this.d3
          .hierarchy(data)
          .sum((d: HierarchyPointNode<any>) => (<any>d).size)
          .sort((a, b) => (<any>b).value - (<any>a).value);
  }
}
