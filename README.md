# FixChennai - Local Repair & Maintenance Platform

**FixChennai** is a civic-focused project aimed at making Chennai a better, cleaner, and more livable city. It is designed around the idea of helping people identify local problems, bring them to attention, and encourage community participation in improving urban spaces.

The project envisions a platform where technology and citizen involvement can work together to address everyday civic challenges and contribute to a better Chennai.

## Objectives

- Encourage citizens to take an active role in improving their surroundings.
- Promote awareness of local civic issues.
- Support community participation in identifying problems and finding solutions.
- Contribute towards building a cleaner, safer, and more sustainable city.

## Vision

To create a more connected and responsible community where citizens can contribute to positive change and help make Chennai a better place to live.

## TechStack
Spring Boot 3 / Java 17 / Spring Cloud microservices.

| Service | Port | Responsibility |
|---|---|---|
| discovery-server | 8761 | Eureka service registry |
| api-gateway | 8080 | Single entry point, routes /api/** |
| technician-service | 8081 | Technician profiles, discovery (category/area/sort), verification, rating aggregate |
| repair-service | 8082 | Repair requests, price guide, quote -> accept -> start -> complete workflow, timeline/history |
| review-service | 8083 | Reviews, only for completed repairs by the actual customer |

Each service has its own in-memory H2 database (database-per-service).

## Run (start in this order, each in its own terminal)
```
mvn clean package -DskipTests
java -jar discovery-server/target/discovery-server-1.0.0.jar
java -jar technician-service/target/technician-service-1.0.0.jar
java -jar repair-service/target/repair-service-1.0.0.jar
java -jar review-service/target/review-service-1.0.0.jar
java -jar api-gateway/target/api-gateway-1.0.0.jar
```
Eureka dashboard: http://localhost:8761

## Try the full flow (via gateway)
```
curl "localhost:8080/api/repairs/estimate?category=washing_machine"
curl "localhost:8080/api/technicians?category=WASHING_MACHINE&area=Adyar&sort=rating"

curl -X POST localhost:8080/api/repairs -H 'Content-Type: application/json' \
 -d '{"customerName":"Priya","customerPhone":"9876543210","category":"washing_machine","issue":"Drum not spinning","area":"Adyar"}'

curl -X POST localhost:8080/api/repairs/1/quote -H 'Content-Type: application/json' -d '{"technicianId":1,"amount":800,"note":"Belt replacement"}'
curl -X POST localhost:8080/api/repairs/1/accept
curl -X POST localhost:8080/api/repairs/1/start
curl -X POST localhost:8080/api/repairs/1/complete -H 'Content-Type: application/json' -d '{"finalAmount":850}'

curl localhost:8080/api/repairs/1/timeline
curl "localhost:8080/api/repairs?phone=9876543210"

curl -X POST localhost:8080/api/reviews -H 'Content-Type: application/json' \
 -d '{"repairId":1,"customerPhone":"9876543210","rating":5,"comment":"Fixed same day"}'
curl localhost:8080/api/technicians/1
```

## Trust & transparency rules built in
- Price range shown before booking; technician gives a quote the customer must accept.
- Final bill cannot exceed the accepted quote by more than 10% (HTTP 422 otherwise).
- Every state change is stored as a timeline event (repair history).
- Reviews require a COMPLETED repair, matching customer phone, one review per repair.
- Technicians have a `verified` flag (`POST /api/technicians/{id}/verify`).

## Known gaps / next steps
- No authentication yet: add an auth-service (Spring Security + JWT); lock down /verify, /ratings, /quote.
- `/api/technicians/{id}/ratings` is internal-only in intent; block it at the gateway once auth exists.
- Swap H2 for PostgreSQL per service; add Dockerfiles / docker-compose.
- Price-guide ranges are placeholders; replace with real Chennai data.
- Add a frontend (React) that calls the gateway.

*FixChennai — Small actions, meaningful change, a better Chennai.*
