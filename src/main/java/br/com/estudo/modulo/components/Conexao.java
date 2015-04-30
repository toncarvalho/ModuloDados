package br.com.estudo.modulo.components;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Created by Vinicius on 30/04/2015.
 */
public class Conexao {

    private static Conexao instancia;

    private Conexao() {
    }


    public static Conexao getInstance() {

        if (instancia == null) {
            instancia = new Conexao();
        }

        return instancia;

    }

    public Connection conectarSqlServer() {

        String driver = "net.sourceforge.jtds.jdbc.Driver";
        String url = "jdbc:jtds:sqlserver://localhost/bdjavafx;Instance=SQLEXPRESS;";
        String user = "sa";
        String senha = "1";

        Connection conn = null;

        try {
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

    public Connection conectarMySql() {

        String driver = "com.mysql.jdbc.Driver";
        String url = "jdbc:mysql://localhost/banco";
        String user = "signum";
        String senha = "123";


        Connection conn = null;

        try {

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
