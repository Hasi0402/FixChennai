package com.fixchennai.review;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestClient;

@SpringBootApplication
public class ReviewServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ReviewServiceApplication.class, args);
    }

    /** Load-balanced so "http://repair-service" resolves through Eureka. */
    @Bean
    @LoadBalanced
    RestClient.Builder restClientBuilder() { return RestClient.builder(); }
}
