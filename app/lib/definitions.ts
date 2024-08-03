// This file contains type definitions for data.
// It describes the shape of the data, and what data type each property should accept.

export type User = {
    id: string;
    name: string;
    email: string;
    password: string;
};

export type Recommendation = {
    title: string, 
    description: string
};