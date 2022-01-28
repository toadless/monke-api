docker build .
tagName=$(docker images | awk '{print $3}' | awk 'NR==2')
docker tag $tagName toadlesss/monkeapi:latest
docker login
docker push toadlesss/monkeapi:latest
echo "Done!"