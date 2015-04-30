package br.com.estudo.modulo.modelo;

import java.io.Serializable;

/**
 * Created by Vinicius on 30/04/2015.
 */
public class Endereco implements Serializable {

    private Integer codCadastro;
    private String tipoEndereco;
    private String numero;
    private String bairro;
    private String cidade;
    private String uf;
    private String fone;
    private String email;

    public Integer getCodCadastro() {
        return codCadastro;
    }

    public void setCodCadastro(Integer codCadastro) {
        this.codCadastro = codCadastro;
    }

    public String getTipoEndereco() {
        return tipoEndereco;
    }

    public void setTipoEndereco(String tipoEndereco) {
        this.tipoEndereco = tipoEndereco;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getBairro() {
        return bairro;
    }

    public void setBairro(String bairro) {
        this.bairro = bairro;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public String getUf() {
        return uf;
    }

    public void setUf(String uf) {
        this.uf = uf;
    }

    public String getFone() {
        return fone;
    }

    public void setFone(String fone) {
        this.fone = fone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Endereco endereco = (Endereco) o;

        if (!bairro.equals(endereco.bairro)) return false;
        if (!cidade.equals(endereco.cidade)) return false;
        if (!codCadastro.equals(endereco.codCadastro)) return false;
        if (!email.equals(endereco.email)) return false;
        if (!fone.equals(endereco.fone)) return false;
        if (!numero.equals(endereco.numero)) return false;
        if (!tipoEndereco.equals(endereco.tipoEndereco)) return false;
        if (!uf.equals(endereco.uf)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = codCadastro.hashCode();
        result = 31 * result + tipoEndereco.hashCode();
        result = 31 * result + numero.hashCode();
        result = 31 * result + bairro.hashCode();
        result = 31 * result + cidade.hashCode();
        result = 31 * result + uf.hashCode();
        result = 31 * result + fone.hashCode();
        result = 31 * result + email.hashCode();
        return result;
    }
}
