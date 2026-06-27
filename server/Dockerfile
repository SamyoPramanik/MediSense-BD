# Use a lightweight Node.js image
FROM node:23-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port Express runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "server.js"]