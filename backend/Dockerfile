# --- Build backend ---
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies INSIDE the container (Linux build)
RUN npm install --production

# Copy the rest of the backend code
COPY . .

# Expose backend port
EXPOSE 5000

# Start the backend in production mode
CMD ["node", "index.js"]

