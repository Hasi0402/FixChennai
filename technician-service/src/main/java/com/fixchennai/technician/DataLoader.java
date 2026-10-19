package com.fixchennai.technician;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/** Seeds a few sample technicians so discovery works out of the box. */
@Component
public class DataLoader implements CommandLineRunner {
    private final TechnicianRepository repo;
    public DataLoader(TechnicianRepository repo) { this.repo = repo; }

    @Override
    public void run(String... args) {
        if (repo.count() > 0) return;
        repo.save(make("Murugan S", "9000000001", "WASHING_MACHINE", "Adyar,Velachery,Guindy", 12, 250, true));
        repo.save(make("Karthik R", "9000000002", "AC", "T Nagar,Mylapore,Nungambakkam", 8, 300, true));
        repo.save(make("Selvam P", "9000000003", "PLUMBING", "Tambaram,Chromepet,Pallavaram", 15, 200, false));
        repo.save(make("Ibrahim K", "9000000004", "ELECTRICAL", "Anna Nagar,Kilpauk,Perambur", 10, 200, true));
    }

    private Technician make(String n, String p, String c, String a, int exp, int fee, boolean v) {
        Technician t = new Technician();
        t.setName(n); t.setPhone(p); t.setCategory(c); t.setAreas(a);
        t.setExperienceYears(exp); t.setVisitFee(fee); t.setVerified(v);
        return t;
    }
}
