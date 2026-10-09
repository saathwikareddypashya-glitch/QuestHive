# ---------- Build stage: compile the Spring Boot jar with Maven ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
RUN mvn -q -B -DskipTests package

# ---------- Run stage: small Java runtime image ----------
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/questhive-backend-1.0.0.jar app.jar
ENV JAVA_OPTS="-Xmx384m"
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
