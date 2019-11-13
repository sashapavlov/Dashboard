import { Directive, ViewContainerRef, Input, ComponentFactoryResolver, OnInit, EventEmitter, ComponentRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';

@Directive({
  selector: '[libDynamicComponent]',
})
export class DynamicComponentDirective implements OnInit, OnDestroy {

  constructor(public viewContainerRef: ViewContainerRef, private resolver: ComponentFactoryResolver) { }
  @Input()
  component: any;

  @Input()
  inputs: { [name: string]: any; }[] = [];

  @Input()
  outputs: { [name: string]: any; }[] = [];

  subscrbtions: Subscription[] = [];

  ngOnDestroy(): void {
    this.subscrbtions.forEach(s => s.unsubscribe());
  }

  ngOnInit() {
    const componentFactory = this.resolver.resolveComponentFactory<any>(this.component);
    const componentRef = this.viewContainerRef.createComponent<any>(componentFactory);

    this.SetComponentInputs(componentRef);
    this.SetComponentOutputs(componentRef);

    this.viewContainerRef.insert(componentRef.hostView);
  }

  private SetComponentOutputs(componentRef: ComponentRef<any>) {
    for (const [eventName, eventHandler] of Object.entries(this.outputs)) {
      if (eventName in componentRef.instance) {
        const eventEmitter: EventEmitter<any> = componentRef.instance[eventName];
        const subscrbtion = eventEmitter.subscribe(eventHandler);

        this.subscrbtions.push(subscrbtion);
      }
    }
  }

  private SetComponentInputs(componentRef: ComponentRef<any>) {
    for (const [key, value] of Object.entries(this.inputs)) {
      componentRef.instance[key] = value;
    }
  }
}