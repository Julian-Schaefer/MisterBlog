#Build
FROM maven:3-jdk-11 as build

ADD . /app
WORKDIR /app

RUN mvn clean install -DskipTests

#Run
FROM openjdk:11-jdk
COPY --from=build "/app/target/*-SNAPSHOT.jar" app.jar
ENTRYPOINT ["java","-jar","/app.jar"]