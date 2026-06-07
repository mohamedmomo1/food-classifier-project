# Use official Node runtime as a parent image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json /app/

# Install frontend dependencies
RUN npm install

# Copy the rest of the application code
COPY . /app/

# Expose port 5173
EXPOSE 5173

# Start the Vite development server with the --host flag
CMD ["npm", "run", "dev", "--", "--host"]
