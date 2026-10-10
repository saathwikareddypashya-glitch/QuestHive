package com.questhive.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.stereotype.Component;

/**
 * For MySQL, lets the driver combine a batch of INSERTs into a single statement
 * (rewriteBatchedStatements). One round trip instead of fifty makes seeding and
 * "Reset demo data" fast on a remote database such as Aiven. Not applied to H2.
 */
@Component
public class MySqlBatchingConfig implements BeanPostProcessor {
    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) {
        if (bean instanceof HikariDataSource ds && ds.getJdbcUrl() != null && ds.getJdbcUrl().startsWith("jdbc:mysql")) {
            ds.addDataSourceProperty("rewriteBatchedStatements", "true");
        }
        return bean;
    }
}
