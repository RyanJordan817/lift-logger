import * as express from 'express'

declare global {
    namespace Express {
        interface Locals {
            userId: string
        }
    }
}