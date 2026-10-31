# Multi-stage Dockerfile for Lumiere Beauty Java Application
FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

# Copy application source and assets
COPY LumiereServer.java /app/
COPY data/ /app/data/
COPY static/ /app/static/

# Compile Java application
RUN javac LumiereServer.java

# Expose port (default 8080)
EXPOSE 8080

# Run standalone server
CMD ["java", "LumiereServer"]
