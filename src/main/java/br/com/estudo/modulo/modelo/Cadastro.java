package br.com.estudo.modulo.modelo;

import java.io.Serializable;
import java.util.List;

/**
 * Created by Vinicius on 30/04/2015.
 */
public class Cadastro implements Serializable{

    private Integer codCadastro;
    private String nome;
    private TipoCadastro tipoCadastro;
    private String cpfCnpj;
    private String rgIe;
    private String status;
    private List<Endereco> enderecos;

    public Integer getCodCadastro() {
        return codCadastro;
    }

    public void setCodCadastro(Integer codCadastro) {
        this.codCadastro = codCadastro;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public TipoCadastro getTipoCadastro() {
        return tipoCadastro;
    }

    public void setTipoCadastro(TipoCadastro tipoCadastro) {
        this.tipoCadastro = tipoCadastro;
    }

    public String getCpfCnpj() {
        return cpfCnpj;
    }

    public void setCpfCnpj(String cpfCnpj) {
        this.cpfCnpj = cpfCnpj;
    }

    public String getRgIe() {
        return rgIe;
    }

    public void setRgIe(String rgIe) {
        this.rgIe = rgIe;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<Endereco> getEnderecos() {
        return enderecos;
    }

    public void setEnderecos(List<Endereco> enderecos) {
        this.enderecos = enderecos;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Cadastro cadastro = (Cadastro) o;

        if (!codCadastro.equals(cadastro.codCadastro)) return false;
        if (!cpfCnpj.equals(cadastro.cpfCnpj)) return false;
        if (!nome.equals(cadastro.nome)) return false;
        if (!rgIe.equals(cadastro.rgIe)) return false;
        if (!status.equals(cadastro.status)) return false;
        if (!tipoCadastro.equals(cadastro.tipoCadastro)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = codCadastro.hashCode();
        result = 31 * result + nome.hashCode();
        result = 31 * result + tipoCadastro.hashCode();
        result = 31 * result + cpfCnpj.hashCode();
        result = 31 * result + rgIe.hashCode();
        result = 31 * result + status.hashCode();
        return result;
    }
}
