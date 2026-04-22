#!/bin/bash
# Quick Docker Commands for Sales Rep Admin Dashboard

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

IMAGE_NAME="sales-rep-admin-dashboard"
CONTAINER_NAME="sales-rep-dashboard"
PORT=5173

echo -e "${BLUE}=== Sales Rep Admin Dashboard - Docker Quick Guide ===${NC}\n"

# Display menu
echo -e "${YELLOW}Usage:${NC}"
echo "  ./docker-quick.sh [command]"
echo ""
echo -e "${YELLOW}Commands:${NC}"
echo "  build          - Build Docker image"
echo "  run            - Run container"
echo "  stop           - Stop running container"
echo "  restart        - Restart container"
echo "  logs           - View container logs"
echo "  shell          - Open shell in container"
echo "  compose-up     - Start with Docker Compose"
echo "  compose-down   - Stop Docker Compose"
echo "  stats          - View container statistics"
echo "  clean          - Clean up Docker resources"
echo "  help           - Show this help message"
echo ""

# Default to help if no argument
if [ $# -eq 0 ]; then
  exit 0
fi

case "$1" in
  build)
    echo -e "${GREEN}Building Docker image...${NC}"
    docker build -t $IMAGE_NAME:latest .
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✓ Image built successfully${NC}"
      echo -e "  Tag: $IMAGE_NAME:latest"
      echo -e "  Size: $(docker images $IMAGE_NAME --format '{{.Size}}')"
    else
      echo -e "${RED}✗ Build failed${NC}"
      exit 1
    fi
    ;;

  run)
    echo -e "${GREEN}Starting container...${NC}"
    docker run -d -p $PORT:$PORT --name $CONTAINER_NAME $IMAGE_NAME:latest
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✓ Container started${NC}"
      echo -e "  Name: $CONTAINER_NAME"
      echo -e "  URL: http://localhost:$PORT"
      echo -e "  Logs: docker logs -f $CONTAINER_NAME"
    else
      echo -e "${RED}✗ Failed to start container${NC}"
      echo -e "  (Container may already exist)"
      exit 1
    fi
    ;;

  stop)
    echo -e "${GREEN}Stopping container...${NC}"
    docker stop $CONTAINER_NAME
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✓ Container stopped${NC}"
    else
      echo -e "${RED}✗ Failed to stop container${NC}"
      exit 1
    fi
    ;;

  restart)
    echo -e "${GREEN}Restarting container...${NC}"
    docker restart $CONTAINER_NAME
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✓ Container restarted${NC}"
    else
      echo -e "${RED}✗ Failed to restart container${NC}"
      exit 1
    fi
    ;;

  logs)
    echo -e "${GREEN}Showing container logs (Ctrl+C to exit)...${NC}"
    docker logs -f $CONTAINER_NAME
    ;;

  shell)
    echo -e "${GREEN}Opening shell in container...${NC}"
    docker exec -it $CONTAINER_NAME /bin/sh
    ;;

  compose-up)
    echo -e "${GREEN}Starting with Docker Compose...${NC}"
    docker-compose up -d
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✓ Services started${NC}"
      echo -e "  Dashboard: http://localhost:$PORT"
      echo -e "  Logs: docker-compose logs -f"
    else
      echo -e "${RED}✗ Failed to start services${NC}"
      exit 1
    fi
    ;;

  compose-down)
    echo -e "${GREEN}Stopping Docker Compose services...${NC}"
    docker-compose down
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✓ Services stopped${NC}"
    else
      echo -e "${RED}✗ Failed to stop services${NC}"
      exit 1
    fi
    ;;

  stats)
    echo -e "${GREEN}Container statistics (Ctrl+C to exit)...${NC}"
    docker stats $CONTAINER_NAME
    ;;

  clean)
    echo -e "${YELLOW}Cleaning up Docker resources...${NC}"
    echo -e "  1. Removing container..."
    docker rm -f $CONTAINER_NAME 2>/dev/null || echo "  - Container not found"
    
    echo -e "  2. Removing image..."
    docker rmi -f $IMAGE_NAME:latest 2>/dev/null || echo "  - Image not found"
    
    echo -e "  3. Pruning unused resources..."
    docker system prune -f --volumes
    
    echo -e "${GREEN}✓ Cleanup complete${NC}"
    ;;

  help)
    echo -e "${YELLOW}Available commands:${NC}"
    echo "  build          - Build Docker image"
    echo "  run            - Run container"
    echo "  stop           - Stop running container"
    echo "  restart        - Restart container"
    echo "  logs           - View container logs"
    echo "  shell          - Open shell in container"
    echo "  compose-up     - Start with Docker Compose"
    echo "  compose-down   - Stop Docker Compose"
    echo "  stats          - View container statistics"
    echo "  clean          - Clean up Docker resources"
    ;;

  *)
    echo -e "${RED}Unknown command: $1${NC}"
    echo "Use './docker-quick.sh help' for available commands"
    exit 1
    ;;
esac
