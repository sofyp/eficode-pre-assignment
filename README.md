# Eficode pre assignment
Mandatory tasks plus additional UI framework and Leaflet map
- Link to Docker: https://hub.docker.com/repository/docker/sofyp/eficode-app
- Running app: http://users.metropolia.fi/~sofiat/Eficode/views/

## Development mode by running node
- docker run -p 8000:8080 -d sofyp/eficode-web-app
- docker run  sofyp/eficode-web-app
- node server.js

## Docker commands
- docker image build -t eficode-app:1.1 .
- docker container run --publish 8000:8080 --detach --name efic eficode-app:1.1
- docker image tag eficode-app:1.0 sofyp/eficode-app:1.1
- docker image push sofyp/eficode-app:1.1 
