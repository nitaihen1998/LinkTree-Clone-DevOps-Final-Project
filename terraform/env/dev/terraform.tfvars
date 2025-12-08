cluster_name  = "linkhub-dev"
environment   = "dev"
region        = "us-east-1"

# IMPORTANT: Replace these with your actual values
mongodb_uri   = "mongodb+srv://username:password@cluster.mongodb.net/linkhub?retryWrites=true&w=majority"
jwt_secret    = "your-dev-jwt-secret-key-change-this-to-random-string"

backend_image  = "orlevov/finalproject-backend:latest"
frontend_image = "orlevov/finalproject-frontend:latest"
