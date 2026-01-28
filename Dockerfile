# Use a Node.js LTS (Long Term Support) slim image for a smaller footprint
FROM node:20-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available) to install dependencies first
# This leverages Docker's cache layers to speed up subsequent builds
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy the rest of the application files (server.js, static folder, etc.)
COPY . .

# Expose the port that the Express server listens on (default 10000 for Render)
EXPOSE 10000

# Define the command to run the application
CMD ["npm", "start"]
