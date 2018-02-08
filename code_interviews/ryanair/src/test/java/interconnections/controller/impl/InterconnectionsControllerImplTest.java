package interconnections.controller.impl;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.Assert.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
public class InterconnectionsControllerImplTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void interconnections() throws Exception {
        this.mockMvc.perform(
                get("/interconnections")
                        .param("departure", "DUB")
                        .param("arrival", "WRO")
                        .param("departureDateTime", "2018-03-01T07:00")
                        .param("arrivalDateTime", "2018-03-03T21:00")
                        ).andDo(print()).andExpect(status().isOk());
    }

}