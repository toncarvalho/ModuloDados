package br.com.estudo.modulo.dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Created by Vinicius on 30/04/2015.
 */
public class Conexao {

    // jdbc:mysql://192.168.0.1:3306/base1
    // String URL = "jdbc:oracle:thin:@192.168.199.200:1521:ORCL";
    private String driver = "net.sourceforge.jtds.jdbc.Driver";
    private String url = "jdbc:jtds:sqlserver://localhost/bdjavafx;Instance=SQLEXPRESS;";
    private String user = "sa";
    private String senha = "1";

    public Connection conectar() {

        Connection conn = null;

        try {
            // oracle.jdbc.driver.OracleDriver
            Class.forName(driver).newInstance();

            conn = DriverManager.getConnection(url, user, senha);

        } catch (SQLException ex) {
            // handle any errors
            System.out.println("SQLException: " + ex.getMessage());
            System.out.println("SQLState: " + ex.getSQLState());
            System.out.println("VendorError: " + ex.getErrorCode());
        } catch (InstantiationException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (ClassNotFoundException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return conn;
    }
}
