import * as express from 'express'

export {}

declare global {
    namespace Express {
        interface Locals {
            userId: string
        }
    }
}