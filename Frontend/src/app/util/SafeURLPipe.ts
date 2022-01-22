import { Component, NgModule, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'safeUrl' })
export class SafeURLPipe implements PipeTransform {

    constructor(private sanitized: DomSanitizer) { }

    transform(value: string) {
        return this.sanitized.bypassSecurityTrustResourceUrl(value);
    }
}