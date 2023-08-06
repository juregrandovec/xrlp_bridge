# Use the official Node.js image as the base image
FROM node:14-alpine

# Set the working directory inside the container
WORKDIR /app

COPY .env.example .env
COPY . .
COPY package*.json ./
RUN npm install

# Expose the port on which the application will run
EXPOSE 3000

# Start the NestJS application
CMD ["npm", "run", "start:dev"]