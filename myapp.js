/* eslint-disable */
// generate something that can be used to help make a unique device netflix ESN number
const generateDeviceId = (esnLength = 30) => {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (var i = 0; i < esnLength; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

// simple caesar cipher just to trip someone up who tries to base64 decode our metadata
const caesarEncode = (source) => {
    const shiftBy = 3;
    let cipherText = "";
    const re = /[a-z]/;
    for (let i = 0; i < source.length; i++) {
        if (re.test(source.charAt(i))) cipherText += String.fromCharCode((source.charCodeAt(i) - 97 + shiftBy) % 26 + 97);
        else cipherText += source.charAt(i);
    }
    return cipherText;
}

const caesarDecode = (source) => {
    const shiftBy = 3;
    let decipheredText = "";
    const re = /[a-z]/;
    for (let i = 0; i < source.length; i++) {
        if (re.test(source.charAt(i))) decipheredText += String.fromCharCode((source.charCodeAt(i) - 97 + 26 - shiftBy) % 26 + 97);
        else decipheredText += source.charAt(i);
    }
    return decipheredText;
};

const proxyServerRoot = "https://proxy-api.enjoymoviesyourway.com";
// const proxyServerRoot = "http://localhost:4012";
// const sessionPath = `${proxyServerRoot}/session`;
const manifestPath = `${proxyServerRoot}/manifest`;
const licensePath = `${proxyServerRoot}/license`;

let state;

const initApp = () => {
    state = initState();
    console.log('initialize shaka app');
    // Debug logs, when the default of INFO isn't enough:
    // shaka.log.setLevel(shaka.log.Level.V2);
    // Install built-in polyfills to patch browser incompatibilities.
    shaka.polyfill.installAll();

    // shaka.net.NetworkingEngine.registerScheme('lic', EnjoyLicenseScheme);

    // For Netflix we will need a deviceId
    if (!localStorage.getItem('emwy-deviceid')) localStorage.setItem('emwy-deviceid', generateDeviceId());

    // Check to see if the browser supports the basic APIs Shaka needs.
    if (shaka.Player.isBrowserSupported()) {
        // Everything looks good!
        initPlayer();
    } else {
        // This browser does not have the minimum set of APIs we need.
        console.error('Browser not supported!');
    }
}

const initState = (initial) => {
    return (initial ? null : JSON.parse(localStorage.getItem('test-shaka-state') || null)) || {
        providers: {
            DISNEYPLUS: {
                tokens: {
                    accessToken: "eyJ6aXAiOiJERUYiLCJraWQiOiJ0Vy10M2ZQUTJEN2Q0YlBWTU1rSkd4dkJlZ0ZXQkdXek5KcFFtOGRJMWYwIiwiY3R5IjoiSldUIiwiZW5jIjoiQzIwUCIsImFsZyI6ImRpciJ9..JTgHJhAF4cuKAD6P.N-c70cB4skGeQK4xBnqcHgjLs2pvidZOdhHV6p8QVQl53jrw286J9rIjo0AsH6x86ej2eq2EOPllQqphrgm7EMjeYC6Ck_tUPoaA3dR8FEDIYcRkAkd0VS3PAuSCKTRG3Duao2ruGvrObmZLN-kpfiDpVUm5MgURhtFfYGuzoNDR4zPmfHAP8U5OL-0JC7d2_T2dAMn4NWtCRB6EQKIXz5hkOiog4cCfQIu8-WSjayr2mftYDDvCIpSpk3zpPJ-D3w2sDvyOLsfMthHUsOfvyYZsVzSJ39jS8L3VMIgVUaQ4gIEVXzn2I5wn2wpFLzodeshsgVjEOmU6Sx6Ct6voOr-moI_W-JIq9GQHoAyLJZ0SRioCymvx01AO9J9MwyORIlEc6u9MNE65x8Q_zaCz3wDHIZXoPmdnD7M23Sliealq9J5WIPiW2HqtOOt1YFovbEkIGJvd7gFxQLDpi9rXSOc0twvtxXpblrH_g6SmGaKbbNZM8dAz29VdKLIMQfELqOuCsH8RvXlTcwd488cikV60VktP-PV-MZihylRD8WKXxHVI2zM_h4lZgId_k_2K1f33RxQidMoRh1mhY1vlYVBblmN7geoJvqO55febhp7sbPOgGNLAcAB3nP2wz2XrcBgGFP2LyBC6upHvC7j0RVcNC3sZu41peAwYwbJQH0akNiaF9b_4Rw5e92sQzmDMq5pWQpYrfa4umL0_3vU1pzcaIVKS_znMLen4ZayJM7Fjp1P-8q4AjUxukKvXLQ0PcSeSGyd_5XLpiiGKC34Vz5m7V3GdEwuFgeV0iMaa3eZJisvI2Z3JvodDdAlieBCM9WwOhm6D_iycfA3vQ0f3wXMyoJooLwcGgw7EV44Ofb7snooRpX4-ojTZr5CcA_LXUjwSEia36ZgjhGS7rzgVDUNbYi9m8zS6A3mmPraef56M7KfwybWXHIQ6VgT3Bzi1zYFKQ9uwdiCWxwoGYKUkruaog5hYwP8iTEGBG8LEDgTQL3_5zg5a9z7UkhDpgP1RrV5fLyJ52Zw0wKgvVojHPltRpzNpW6L_YexVWbC7ovfdEM7ReVtryjDZNDpgC7vkg5JtooTEJ4DnQ4StwRdqMDpRjAUxokCsoS1RHDbnIePz6iDapvyFs9ggam_nj2MvPO9WPEMvin92oSqH8QFBas4wLoPcOJg0AND0xddQX2Ic9lNM4pXEp8XbE3w2asIMpTSDOF6o0RbWwxOCiyV72zNVauNsGaEyF69PHOBQ8RTZ83MlXtB4J_zkcVlNiinzRQtoshgw-JhgKvLlpO4lZSWig3zUd81AdKwwsb65PMeJ3mZmEAvASs341QZvDBF1aMFAYrmpqpzxCGRxNre5ptdhiDo7sv92xxg_-95tdmd1C3XmXiptHgk7ryhf2aF7IJfX1aqczwpTAdrGFbDrj4FszIUQjv3s2HwURaF7hh-KMXwqEZ-1sQy5hmCVyXDxc3LZlqAu99lKwUXeLCzosUASRSnv5piLWtx8DISee77uJuyYD6foc38j_IDxGxm7uKlAVInwpj7ksfNFa3Gn8syDkIxZE67r9E4NzTpB4fwdViYPAV0HF9LyGTcAt9C0gw9PQzlBsj4iiTkOIpYv7gO_Eu0omUjafAOri8OXEMVBUNhqiU-xLDq5hFaG3utGI7wASV7PIa-CFZHfwvMVaXmnDL5eoE49g5C7MDtsed5mLs8FkNeTj1JPU0fnmPYCX4UtJnvFrQdUqvtaqAAudqxkKyuudy0HJDnyfzonKqghYZh_et1qiXjQ7fJ9k2vn2ZoMz9VQciwTvMvakxyCJ7y8jn4zNh2v1HwKJlgRcGhvzsJk0p5OQ__kWvc6vUV36ceSzeIpWiA53Oqvokgu0sdgsV6-hY78EPXAuHdk1EdAOuBIhPVcXGbmUJGpGIvQBz-Gp4-2dxmzdXWs5-RcsQg2KJdjtCSzsxpkZHeX_Leaqxk_r9YRG8PcZIGstZOrwCRdRbL0D_Xe5IXJo1Ir-RyyJTAcYSvVxAGS_P5roQviAO31mjifHglRGrAHj2RczlyGMOjh-0Y9VqpL-zemihH-B4H8ZhzpSgRjD9as-OCRFNkIpmWbbfOs5VD7h71SbeIkGkZBDYM6_TanbvLnd8e3DFokkAluRKUjpema6YB2RPVl3aY72GLoySeQQ8HUppDsx0X0fk8PwSonwA4A2XRD5J2rrWajKa_B2PPT-df_6Wwdms1UncDjOurIUpR8oZbgjNwL1UDS4vu6NWrvX1_GacAi0JV5ULgcHAAHuOYCkr9SUsmceXvAYtfeKHUIb_-Bdx7imvuTl72i_hF2DLHGDjAkB3JJkNZ0QU_6V4qLPlYlm5Ji1xO8RbIfs8JZO9zkAPRukSA2AXIXrMfb0sGNdOZtpbOBn5brI_A5JkwAChJe5RFnVas0mv4qiXBGCJJbN6gHM8k1dNK7NlPEuVHAiIMZq8ZyP471QDpWLwvgDqIdO0sq0jI2GWrfnh_tLWPMPBPeyhOGI_5FYqRISHpbHiDTr96N3xtQRHVUp8OzzpuEopKMwUC8WpYpVJnRfWYtmnQ5f4GI1JkRYb-ITk-G0iM81wD6J1hOP9sH0C6GZ9ssce6vTobZpaQ7zQ8O18fIsChCHP-VYFPaPpAsZ8i-Z7lCD5Lifcn-8aYYenBNfLmmWF5lmuD3pD5VAB7RZIgPK-MPV6x_IrJNwFEyrPTUiAx-FtCi5yV7YTB1D7kvwnkQ0V_SYN0ARE0oHkhxfzEBBtT4ZgALrr6ozAfCK8pZ1Rhu9Hp7IXJpIQjKBuwQ93QJwt9US9GwKKoICM5ivfJqGG0NorQYeKCz0LeZsrYEWPkgaZDEgmU5pzsd5OeWIaftldzBZp9WjqEhxBoIjFsE6-31FecUP_X2yir89-ASkdXd5IBtydAQejk5wBkvjU1joh1MiZ8JS9iScnAN5_AvfVNvpH55lBGQESe3KWTlp6h45BGh7MhT2R_oPbvoO5aD7b7xfAb1t-PW6vFYKwnD5Ay915YlExf8MrTrw1hMjPiHyIvRPkU_8qR_bPhwwI2cPb_dr4v72_DFJirfdXCEw1zeIyuh_KudZXhjoYapemSWXUHNlFM-bHbNQxYOtfaGSorueQT3FhzmKD8pcTMC6aQvMqZLVLnW8p6VqYnfMMI7sWzTKd_k7dnSWUoWyjfz03iyEEkw3GYdouZIcAMlL_FI9QUUqVcbpmZ4RUJtLYLuKflI2H9U6MU1iLOCI3JKIhdODYoEjI7ILeq1YAF6yqu_4CQ5rHEqSOfafxiLUtXNs2EI4hF6WnQ.YntuvMuKXFa8VWiDl53rZQ",
                    refreshToken: "eyJ6aXAiOiJERUYiLCJraWQiOiJLcTYtNW1Ia3BxOXdzLUtsSUUyaGJHYkRIZFduRjU3UjZHY1h6aFlvZi04IiwiY3R5IjoiSldUIiwiZW5jIjoiQzIwUCIsImFsZyI6ImRpciJ9..EXPBupBtBR8fB1Yd.p_AHyGgOE7Unel5gigTbyBeUikEjm1ND6R-MvQAhnilCxFPqIaOT9d-vSVK9T2Y7xbvMsTTi56dcMwKiNc9uXPiJKVoZYPQ_w6rPuV1vKNOpSsWiXIiPYxHynHg0JJ7bY7O2UT9QB7RQelnEPqwsC8rJkj38zo7vCUyeqZsO0GiNOgmRGqYCzLUVk13v1reN0VzWyks7Mt6GiA-Z4V6C6zVOaFTToMqxYzv0Xc8vNtPgmEvpg8X7J-N9gPo9hJIiul97wNrWoOBKjNFeDV3Q5WGSY1c3jVMGPYeD7TLDQslCoOTR6QSrIJdIJldngyyDJunr7X3zxC36ZHp2HUZ1uaIjhsmmo55HECCcUJ-lZ7fBj9SyPxiVzP_vPqsfO7yzkmnNN4wXuJn6F4Gssg6c0OjdQk9eubixl_JKu9FC0Axvxl_l1DZUzuJbVEKsF8nax6V1KohIePQHaFDv2Bo8M6BGu5WJIlL14ymAA_oktKUgfDh56MMrP6ICu-jWSmqkJ0hL_1iyUyr4aFWE1CIeve-biyvZB2Ye2pmTwGu48YczM7ajfRTfZ7_VTsw0JpkWkV13W36hGso4jKNnDvJwLKU2fEv1exzu7SfPsn0fVzk71io1XMG34FDfuMCYO8QdjJdPvETsJjjyOCITkGpW1jnhPJ3TOBrkciJee3hpURvZO6LhMI-b1RcoVRDnxO4hLGP5RLbIjaA0lMi5LGq24LOOGzXUHAFpeJvPlJo5x-GixHt9njL1sTreqiVX95G5G6puu4ptFrObIHa9j8PysZBI54tvjB0RPYtNB3lEq_dYUPVqvAqMdJKVQim0HXoJns2GIoXFkBNyfukYFZoTPXLaoD6YLV8l476mIIvP-MH4Lr3P67kf6j-kdk_nmqL-EcYnkZwVojUzbLlGRmP4NRQDi1efGKOBObc2e5Yo2DMi6FyWsvP9c3nXxmEhlaPwBkeFawpOj7AdV3Se5qRb1og0l4xWZtZ85VQL1Habcu74c8D54Y23OGbNNIlweflKLvldgfhJsM1VMagcxV0h33L1SQa0fweMJXf39Iq-8TOJGQASXgzuzAf_9SJqtUoM6X7wu5Y8BgDunF0sN7yedBRg1Id4oo53SNSw1-8QGaEr0OTUKH2MWRGn7FvMnYCwPG2orEtkxdk1-JAnJoZmY6ChfYQFHfci3r5hEz2a31dCnf7R_tDTZ45S0nSknakqGz3TDjqUrz6M0zex8Bjqb45fPtGsqr2PncwiJ14odoQQ2Pji_gNlbWMF-yOiEU0S18cgVPFHT7TbjmxLqRbsr3NwrcSzMLY7d62awyO9_Re2tAfluyqP3iclYkdReGSZKE-9BCIiS11IJWR4nuUSfbSP97mU4JxIYer9eHbmt8CmqkTUMULkPotuOpq9Z5vZ2EOEnrBb9QyJrw2i__ZBV3J9lsgi-ESjDjFIDGM4K0rpm8_W31CWodrq720mI8OYLQ88ytXdfq6AwCk_VbqDbRFZi-Ka5UL0dMvIipy8l86V-euUhEZ2LMcLwByJcg_TDwdsQ68sr67AmoWyTMWfS_bGeG0ZO2RUcIKzkU_M7TX6rEG-cPAu3zYqC7TPrxVmEFwmv03ikmVoqwuo3UJMiFzeEGUz0Rgkj1vvuLLeXebJsfGggJxWjf5tYwNJ6CAT9-KAkvnLfTCgbvWmX0ZRMkGL_AfceEf6PO_P0XvZi7yxJekVhdbsGexV-8K2wmyI6YJKvypiLqZ2Ck4bpk1wa9uBxpEVgjsbwginC82OMX3gQdJGs2CJITajU9nhp25GVHsS06pQN9YewxYZ2oYMUy3by3CP01R1LpeIVGYj0xIIOMkD7Q8Hn9D_PiN9BjREUokv_Kaj219X_EF8CcyUo27eklUL8VLBDNdVreBCBTjUgUH7gAknhUM-m3b_EIZS8vtiisorZHVJ9x-9pfAimnYX27nLoeElfULeDC3xYqUFlXE3JTUgecdYOtY3ROjh5HR0PyfXW58FH_FFYtKKrwYhj1XPdfCnkDRgZQJ8Y1R5pj2Kg_ru5CfWwpN1dYVMDKzvCwRH2i4YLrgQG8WBCqOcbn5n3Ayzy5lPbwGmH19u3S4CsMycT9Poq2f5kJ8wMGPHi0eW9zK7vaOWtSSnfajWRPGS9AwfayLoPxsMDpwHzwD1tApj2hJOyo3d85G13nIjV9R8X05PrHDVHXbGJDxYTT1gvVSZvYtvMMxAnrJV7SmuvXtEn07jRp2Sg0E9Tpk8FnGOoxFYjNG5Vqo28nNA2ZPe1bUCCNqIIH-FJtFm5q-66dhrvB5MYBKYQYzIYzvzUkNcXOmJF333wBuedy65K_-fjLYQE2bdjjBYA7VnwHZfmxGYNziDykCCNTBUKgwk_-0ThvsSeSkNi7rzIFREnEU2YJTh0JZsDG-FO7rpOgE4ShP4b9Y9OjDjlT6d5jQ62HTLybi8X1dS819iUSkITpfT7nA_4lx-eJNod5jvaLgDi06MgD6RyyhoZyDCSpP5s3prMd9wBr6ZS1qmYArYkGlA0we6G2Sxt_EXVGZO3otQa-z4mjTFYpEn2QPnWQJMkkUURuZo5qZLKml7rvFLfR1fhNMGUBd6IForYEHxYrVnzm4QRcMBcngy-Z7bW3Joqn7H5oewaHxnQqi2spqBKGuhMjxR3lxCcNm0eo-5O1l4BbXLwn3lo0bwrfOUCXBtJ4hMjNWPm6bdaq9A0njsO7pTuyP5crSrQvR7UbkpvjAVjk6SoBXsL7H-RCn5OF4VautQwIFlYGR5NS1_3Y4mY8TOzx3K0CE_eA6Mu0DUZytuh4lLcQjJdwmF_zny40csioSuhsfGkdzWH5MWMon55cWqlkeju9qyT_zXyQYyC-X2gHCea7jiTs6QzbA0LOOOKwhOfN-bkCV2Y0RVm9IH6hh9p_ShXqsCvfBH6g23A0b0QCkdMOjIwB_T_-7OMzCUWmLpd41REZJAi_HJPTbs5iL_yCeTCCq1RtLs5Q-Sqi4lnIp7ThPlzAYQjCbAjjZhepzPsg38Jxd0so3Oz5DuWnw46tsgwwotUbBJ3KUIS2WE8bW-AOnuNMWYXGxST5hpP17ysUFbqE0xA3ytXESQ-7tt4ExumnRvoloCv78oqqZo_ri_p_uYaaqCoocoy93kgUrWG-BoTPUAKWnRTAW-RLIbfl14YsB9kitwO12uqI0TAKJ7gPCLB1idZCURQ9OUYeBIGC0UN5Klrk9q7S3nwnL7-L3pX40JhDmJG_E6NcW8tIS0K8ywRQ_x85TtLRImnjY6McqnZAUu08mGunkMIscXX2YGmfMhIZXOrnJkAfaI6TTW-YMpfh3G7igCEQFiAbrnCZWIf9hyMnI0JK04NSeMrksrv44d1fpJRTexyWcpztoj1pjyKhrxH0veMfSVFkoCliN8kmmftYJaU8z3T5Si1M407p7ycEHcEBAlL508bVsrczPpcsKX_iPGOtvT2oSebTVpIpm3UCAFaxAx92VCbIsAJB09-oWBtvGKxmsQEqQ8u0RGoEc3h3DfdTihL5zhSMW2wVn2OVhyGjxknXZu9zc4oVzMSHwoH1qod24YE6C3.ftKl6NEl_WpCb717IL4bYw",
                    expiresAt: 1630119804620,
                },
            },
            HBOMAX: {
                tokens: {
                    accessToken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0aW1lc3RhbXAiOjE2MzEzMTY3MDk5NTksImV4cGlyYXRpb24iOjE2MzEzMzExMDk5NTksInBheWxvYWQiOnsiaGlzdG9yaWNhbE1ldGFkYXRhIjp7Im9yaWdpbmFsSXNzdWVkVGltZXN0YW1wIjoxNjMxMzE2NzA5OTU5LCJvcmlnaW5hbEdyYW50VHlwZSI6InVzZXJfcmVmcmVzaF9wcm9maWxlIiwib3JpZ2luYWxWZXJzaW9uIjoyfSwiZXhwaXJhdGlvbk1ldGFkYXRhIjp7ImF1dGh6VGltZW91dE1zIjoxNDQwMDAwMCwiYXV0aG5UaW1lb3V0TXMiOjMxMTA0MDAwMDAwLCJhdXRoekV4cGlyYXRpb25VdGMiOjE2MzEzMzExMDk5NTksImF1dGhuRXhwaXJhdGlvblV0YyI6MTY2MjQyMDcwOTk1OX0sInRva2VuUHJvcGVydHlEYXRhIjp7ImNsaWVudElkIjoiNTg1YjAyYzgtZGJlMS00MzJmLWIxYmItMTFjZjY3MGZiZWIwIiwiZGV2aWNlU2VyaWFsTnVtYmVyIjoiNDFiZTFlNzYtZWM1Ni00MjA4LThiN2MtMTcyYWNhMzU5YjYyIiwicGVybWlzc2lvbnMiOls1LDQsNyw4LDIsMV0sImNvdW50cnlDb2RlIjoiVVMiLCJwbGF0Zm9ybVRlbmFudENvZGUiOiJoYm9EaXJlY3QiLCJwcm9kdWN0Q29kZSI6Imhib01heCIsImRldmljZUNvZGUiOiJkZXNrdG9wIiwicGxhdGZvcm1UeXBlIjoiZGVza3RvcCIsInNlcnZpY2VDb2RlIjoiSEJPX01BWCIsImNsaWVudERldmljZURhdGEiOnsicGF5bWVudFByb3ZpZGVyQ29kZSI6ImJsYWNrbWFya2V0In0sImFjY291bnRQcm92aWRlckNvZGUiOiJodXJsZXkiLCJ1c2VySWQiOiI2NjBkZWViOS1hYjhiLTRlZTAtYmRiYy0wZDljNWM3MDU3OWEiLCJodXJsZXlBY2NvdW50SWQiOiI2NjBkZWViOS1hYjhiLTRlZTAtYmRiYy0wZDljNWM3MDU3OWEiLCJodXJsZXlQcm9maWxlSWQiOiI2NjBkZWViOS1hYjhiLTRlZTAtYmRiYy0wZDljNWM3MDU3OWEiLCJwYXJlbnRhbENvbnRyb2xzIjp7Im1vdmllIjoiTkMtMTciLCJ0diI6IlRWLU1BIiwicmF0aW5ncyI6eyJNT1ZJRSI6MjEsIlRWIjoyMX19LCJzdHJlYW1UcmFja2luZ0lkIjoiNjYwZGVlYjktYWI4Yi00ZWUwLWJkYmMtMGQ5YzVjNzA1NzlhIiwicmVxdWlyZXNBc3NldEF1dGh6IjpmYWxzZSwiYWZmaWxpYXRlQ29kZSI6Imhib19tYXhfb3R0IiwiaG9tZVNlcnZpY2VzUGFydGl0aW9uIjoidXMifSwiY3VycmVudE1ldGFkYXRhIjp7ImVudmlyb25tZW50IjoicHJvZHVjdGlvbiIsIm1hcmtldCI6InVzIiwidmVyc2lvbiI6Miwibm9uY2UiOiI4MGQ5NjIwYy0xMzc5LTQyY2MtODg5MC0xNzM1ZGMxYmM1MzEiLCJpc3N1ZWRUaW1lc3RhbXAiOjE2MzEzMTY3MDk5NTl9LCJwZXJtaXNzaW9ucyI6WzUsNCw3LDgsMiwxXSwidG9rZW5fdHlwZSI6ImFjY2VzcyIsImVudmlyb25tZW50IjoicHJvZHVjdGlvbiIsIm1hcmtldCI6InVzIiwidmVyc2lvbiI6Mn19.03UHosXjMld5pooQqXA5tvW3q89v14kxa68yiON_i7A",
                    refreshToken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0aW1lc3RhbXAiOjE2MzEzMTY3MDk5NTksImV4cGlyYXRpb24iOjE2MzEzMzExMDk5NTksInBheWxvYWQiOnsiaGlzdG9yaWNhbE1ldGFkYXRhIjp7Im9yaWdpbmFsSXNzdWVkVGltZXN0YW1wIjoxNjMxMzE2NzA5OTU5LCJvcmlnaW5hbEdyYW50VHlwZSI6InVzZXJfcmVmcmVzaF9wcm9maWxlIiwib3JpZ2luYWxWZXJzaW9uIjoyfSwiZXhwaXJhdGlvbk1ldGFkYXRhIjp7ImF1dGh6VGltZW91dE1zIjoxNDQwMDAwMCwiYXV0aG5UaW1lb3V0TXMiOjMxMTA0MDAwMDAwLCJhdXRoekV4cGlyYXRpb25VdGMiOjE2MzEzMzExMDk5NTksImF1dGhuRXhwaXJhdGlvblV0YyI6MTY2MjQyMDcwOTk1OX0sInRva2VuUHJvcGVydHlEYXRhIjp7ImNsaWVudElkIjoiNTg1YjAyYzgtZGJlMS00MzJmLWIxYmItMTFjZjY3MGZiZWIwIiwiZGV2aWNlU2VyaWFsTnVtYmVyIjoiNDFiZTFlNzYtZWM1Ni00MjA4LThiN2MtMTcyYWNhMzU5YjYyIiwicGVybWlzc2lvbnMiOls1LDQsNyw4LDIsMV0sImNvdW50cnlDb2RlIjoiVVMiLCJwbGF0Zm9ybVRlbmFudENvZGUiOiJoYm9EaXJlY3QiLCJwcm9kdWN0Q29kZSI6Imhib01heCIsImRldmljZUNvZGUiOiJkZXNrdG9wIiwicGxhdGZvcm1UeXBlIjoiZGVza3RvcCIsInNlcnZpY2VDb2RlIjoiSEJPX01BWCIsImNsaWVudERldmljZURhdGEiOnsicGF5bWVudFByb3ZpZGVyQ29kZSI6ImJsYWNrbWFya2V0In0sImFjY291bnRQcm92aWRlckNvZGUiOiJodXJsZXkiLCJ1c2VySWQiOiI2NjBkZWViOS1hYjhiLTRlZTAtYmRiYy0wZDljNWM3MDU3OWEiLCJodXJsZXlBY2NvdW50SWQiOiI2NjBkZWViOS1hYjhiLTRlZTAtYmRiYy0wZDljNWM3MDU3OWEiLCJodXJsZXlQcm9maWxlSWQiOiI2NjBkZWViOS1hYjhiLTRlZTAtYmRiYy0wZDljNWM3MDU3OWEiLCJwYXJlbnRhbENvbnRyb2xzIjp7Im1vdmllIjoiTkMtMTciLCJ0diI6IlRWLU1BIiwicmF0aW5ncyI6eyJNT1ZJRSI6MjEsIlRWIjoyMX19LCJzdHJlYW1UcmFja2luZ0lkIjoiNjYwZGVlYjktYWI4Yi00ZWUwLWJkYmMtMGQ5YzVjNzA1NzlhIiwicmVxdWlyZXNBc3NldEF1dGh6IjpmYWxzZSwiYWZmaWxpYXRlQ29kZSI6Imhib19tYXhfb3R0IiwiaG9tZVNlcnZpY2VzUGFydGl0aW9uIjoidXMifSwiY3VycmVudE1ldGFkYXRhIjp7ImVudmlyb25tZW50IjoicHJvZHVjdGlvbiIsIm1hcmtldCI6InVzIiwidmVyc2lvbiI6Miwibm9uY2UiOiI4MGQ5NjIwYy0xMzc5LTQyY2MtODg5MC0xNzM1ZGMxYmM1MzEiLCJpc3N1ZWRUaW1lc3RhbXAiOjE2MzEzMTY3MDk5NTl9LCJwZXJtaXNzaW9ucyI6WzUsNCw3LDgsMiwxXSwidG9rZW5fdHlwZSI6ImFjY2VzcyIsImVudmlyb25tZW50IjoicHJvZHVjdGlvbiIsIm1hcmtldCI6InVzIiwidmVyc2lvbiI6Mn19.03UHosXjMld5pooQqXA5tvW3q89v14kxa68yiON_i7A",
                    expiresAt: 1630383042789,
                },
            },
            HULU: {
                tokens: {
                    cookies: "guid=A30498112CBAC3C92A2C19AF1AD3F7AA; _h_csrf_id=2cbdbb763a17b4f3b38d6b417ca99712fe401e855c48ac8f2e65ed93641ca58c; _tcv=28a6b5388efe8f4fcbf2853ff20f90d3d3bd5deaf61d7090d85526415bd8dfc0; _hulu_uid=46639262; _hulu_e_id=3iGI8ZsdtvYXk39Jt06QDA; _hulu_bluekai_hashed_uid=925bd28da16179d7364d20b52738577a; _hulu_session=XGP8kLyD_0UgPiyw3aCL6K1isdc-Mv7tKu6TUJHTKDI1hdAQqA--rCrEn9vQimhD0ebx2xIKBHWSn3iQvswraqcHttKvoEoCQwFnmqqJ6WP%2FxvBcjOeb7Txyzrz6_GDKGW2qRuEh5iI41rRNM4GukDw28Pe%2F7C5HhKhYUUjL1UZzLH89C89i9KLRL3ocU8KESGcieQ1APs4Zm79zX97h3_DqYDMfnWk%2FOBaAV9Xni6oP%2F3WZU0P7rivfa4_GGwvLryAiGofUqwnT9XxPhGm%2FqEF2rqnFNwRrlWkP8iHf2I6it1AIe55OhD5U4mJzRal47fLUiC70mAz6qtPepfQKaznaXP92R9Es4ephEpL%2Ffo7seWwnp2eQjnYyuOR%2FHxgzGZl3KkY_HC6bv9o5o7PVwRdxlq3amIEYQUV0dhgSo6sdlmwNMPFWJOqoXfl5uLa7cWexty0zqvTiENiHht8_GbGovylQcBNx26zyfUiNOrsH%2FQmA4qHC97uXVud1rK9kUehrfpF5m5kcz%2F5HL6_eNbn1g0Q5rWHsecsg926PI0I4hLHfO77GYEnZydpShaBJiGR_5JDnwudisthAmZYvwCivyulo4AwyARiTWOgOkY28PpOVPXCvo3iQv_IQyoX62OhhV3Id3PhU%2F_HO%2FkAQdHVXz_Q5gXkIna4az0ifBmWRrBRT9uQ975NllvKQn2jQjk4UVqhgXxq8lBAIcWY1VFVPaKpMWx8pgIXpi2GGGsQGOwkZTxURfC0FK%2FD3cZp_5uWsmJ2lXzi3YmVPjxE7E_l4FLBOGkL8ueOtsynOSVS9KZ8adpZtRrbTKb%2FA36VbVYEEOILrzqXDPE5MYraQ2ml_NXo8_4gFTTjCo2g5JxodlLNjJ1TPZuWwQLOAj%2FFZqLO2z1TohzLdrGkWaLT4nTAByI7zoHXx0RTfR9hFbBVDBwv5SuxdJFB0QETX_7PBaLlBPw1DGfiQrQAv7sybEvzJg6k5O%2FQ-; _hulu_assignments=eyJ2MSI6W119; _p_edit_token=HzOSofd_fr9qoIgdj8koKg; _hulu_dt=22yqLkm9ZF5EpJ_CZE4gaiQRh7I-t7WEKTBBEhokEKwUPLU9xA--Awu04xrfMsVZFaqby58Ly9gFNd_H5d_WOdSE%2FnUwMpSQdZw6Sqb7fvPklsxfmwb6dau3Viiidh7Iw2n%2FcVohOSRaYpqic2DvlowLJ1wmj_m87KDt%2F0NjOLIdoeFeDUTUtqD9wbPRKVC6INx8OcENb3TQ1LdLpq12UWHsymTw5WS_tLhaGambY8rWvfR944OsPE%2FvY4rhBfLfREjUuMwgwLiY9R86O3lffxm9T_HxrZAyvBpRPmAfbp52ABFukAypd1wtUYn_%2FZifeVOExvG%2FOElI%2F3gAAOWUnVet6gHZQmhw2b1OCi0IB0k5Oc3oT1fqbXVhC9ZbmGgzEEoHUkeCoaXCiTa_IAo2E5JK58dl1OCTXwwGSBrej7QjVs7nAtePSjd0QcPioOyb7sfHBbFqEGhGFI%2FJzQgSf568DcTRJTHAgZsL_Cy004ZbGO7X%2FgHRQIYnerfXV4T9lKv%2FCORnysxYRVDpoa91BZHg3Jc02UsIxyC3Js0FAMs32i6%2FJM7mYndoO_aM0YEaUXrG9pa_CnEfHCSdocyqeZWdO5pwDxD4Hphe6t40mxxLgACepqDjjs3eqmCDtkWcTZTEEwIyPgUz4Awb_CEXdb1t947bdLa6vkNkuDm1iNMSmcX9u9fl7%2FJMhL3CIoopQdtF2vK4D4vx8yyjIasdNHYOhnrt4DvWGeXeMDzy59NHlMUwv7cbxM04MPTCXGw2i_3rbEM63PQ0R8IUrczy9eUQSuWTpCCourqdy4f1JsO4y6amoVt1RGyG5cNs0bBtIwEuyu2w5DaJWAq9jaz3EDnDDItPYAdLBxVcbrPlBqJomV6heNVu%2FFbXx8%2FmGK9ZMUumMRQVSjAvROEolEH4mBvBgAaiVaI-; metrics_tracker_session_manager=%7B%22session_id%22%3A%22A30498112CBAC3C92A2C19AF1AD3F7AA-54d3474a-30f0-449c-8a73-e69a9327ceee%22%2C%22creation_time%22%3A1632342926365%2C%22visit_count%22%3A1%2C%22session_seq%22%3A2%2C%22idle_time%22%3A1632342992810%7D; bm_mi=7C3319BB402837804553EC8198530CD5~rRQoi3qxtEp0GbhtoHRur6Pq1O5UPRGk0Ku7OLdpHmyH2MmyNEItfAQnOWNqiw+rJScVdFJy8JvUMsE+Bhyj426U0jMPcyKbPqDm0bqCIpkueHlgo9JIwrozUHJIyDln6IsPH6ero7LAC9wf4C3HCVvyXibturmnhxOoFzoz8LK9TfheytQ80QPEfPK6eepXCi8FJWQ+PO8NJZNLBXqA4XGJDiGrGTgtfRq3K/FAgzVaozRAS+E8XSjQ/b4hLMaIFRAV0700dby6xf8QivON8w==; _hulu_metrics_context_v1_=%7B%22cookie_session_guid%22%3A%22F43B7F7EE2BD6C72AF65ADED0EA96784%22%2C%22referrer_url%22%3A%22https%3A%2F%2Fauth.hulu.com%2F%22%7D; _session_referrer=auth.hulu.com%2F; sid=3ADEA52CA57AA30323921D7930C66A0E; beacon_seq=0; _ue=1632343004; _hsstat=existing-subscriber; _abanner=0; _rcsources=download%7C%7C%7C%7C%7C; bm_sv=C861C49F4BD151CDB94604DD152B2F7E~78lQk5X+4vKPt76fxqG5LGvOxeC5JccNXhMy+xRqn9aWpleLeoFlBHwbOnNrbZZsYUdSRIkL/t2aW8WyKdic0tJKMQ+sKZSMAywDwBPB3L3o7uI3mCzU58GzQUWz+Z8OTlCzAlrQ91dVDJQh9Sdrew==; _ga=GA1.2.757913165.1632343009; _gid=GA1.2.1759405579.1632343009; utag_main=v_id:017c0f385be0001dee35e0afa12f00073001f06b005f4$_sn:1$_ss:0$_st:1632344806959$ses_id:1632342924269%3Bexp-session$_pn:4%3Bexp-session$device_category:Tablet%3Bexp-session$_prevpage:%2Fdownload-app%3Bexp-1632346612482$hhid:0053a6298c752da7933b3a31135e2d7298dc02caac382ba34286ee7935794565%3Bexp-session$dc_visit:1$dc_event:1%3Bexp-session$dc_region:us-east-1%3Bexp-session; _gat_hulu1=1; _scid=7875db9f-f250-48de-bfd1-3c4b39e7f8ef; site_beacon_seq=4; _sctr=1|1632286800000; XSRF-TOKEN=5259a13b-2afe-429d-8aa9-80c2002faf4b; _hulu_pgid=117923843; _hulu_plid=1886389224; _csrf_id=acfe57720dd071bca9d8f0badce78e026c6cd432ae9b7bfe24d11387a80d6a67; ak_bmsc=189C1EC27CBD1527CBC17FFF3FD90CAB~000000000000000000000000000000~YAAQZJURYFlsVqJ6AQAA/wE6Dw1xPHGNBCZ8xdwJkR5l9XHsWQ7mMSaKySHigD/Bi2V9ftnAWQxNNOSWo+lTKSP0iqZtOwxKh+49RAEmKH1FEWBa9sdEs/IQeAuPvab1nocj3EGm3LumyBUVEC7b17cgJgF5kpY3Amd+okaLy0RCRW1H+dyLFvHn7nkZOufcb9oGfIYmDsi1BmkwfYl9aNVvb+fTPB2cbr3BO8xcu+R7s3wjxYMpCCZn7It9hNLoYBhIbnEnkXyv/MzKN4ibvPclwcUwhWErSqRHnqGQImygDw7hNcCcwVl8n5jy8CYMxNtajaxjs3zZ4vGi1lvv/2iAf3yP5iD/39/ECM9MSmAC9K26BIsbqY9zRhdMb9+CW8PV29jQG1uNbRMmcVTrh/FDBKbb/sp9mcdlvb3mWWO2N/7zXZse3y3bFEDMIn/CSI0bsgGkO4WBiETJEZtCekI=",
                    expiresAt: 1630383042789,
                }
            },
            AMAZON: {
                tokens: {
                    cookies: "session-id=133-8373025-1570834; ubid-main=130-0828590-3776626; x-main=\"ms4Q5GPjHIQfotg0j@VKNsq@DgFAM7C2\"; at-main=Atza|IwEBIAdEzCoHdjBLeUvo2WfVL68YZT-xXca-m4NJhi_r5STovJNSRaJjWoqtMmmVDdh9bTsXyU-q27qg8B92FoqGGG2mesp3Pw-dsheBiB24RPbH5MnVYIQn5r1nwIdNI9SrBVtzuiWyuOkdg5Lb8lXLbWZzmMOwcWuZFshaXjmkCg7fLMyrVUR1xNTb0Af0bLfb5ugK8JPFccJbWv-H7qiVe3Mu; sess-at-main=\"NyG2KETCK+qyh86Z+y/idArdjHlyux7YmFkO0FoTR9E=\"; sst-main=Sst1|PQFzfKHI8GqcDX6utsyuoK0ECQ9qDA5H5Te8TcU4nK0J5QxJvNE31j05FPnvMNG2PCgG3nOJpYCtNxuWT-FRm46m9cd8D0cu9j9dpDLBRX5e9SvquSv7loSMNA6FqLeekPM4hvwot9vm3JCl6wRWinz8kNyUzrYvVQWekaJ4nhvDCUbdK6bRlphRp1QJUdLZ7e1YGEu-gPGn0s-_SxmRC7I0DcWofHptaLcjhrklZAjf8XZbnlBYT5YVmDOtyS911ZafGGzQwI4HufRdrKMJRhB1dlogK7XZGd_0r6ieM4ldIu4; lc-main=en_US; session-id-time=2082787201l; i18n-prefs=USD; csm-hit=tb:s-ZD34YQBJR1V8MZWQTQFC|1632497663456&t:1632497663457&adb:adblk_no; session-token=\"ctlMkhpHIxXu9TYYZQCcHImF3bU9/d+JafVKJjqnzo43DoKifYvTZjtPuv6Om14CzUm+HZXWFFAY+xqCzSJh1kgl03CEAbuI1/A0pGxan8rcWrpRNUa2/EDtRTG78Sj0zN71bQyvdLB7NtoCW+vZoC39C5xwQGFNcMYjZpdlTpC/A382+3BUV2DyoGvy83oWyiJbLeGZDtR+0LgQcOvJJQ==\"; skin=noskin",
                    expiresAt: 1630383042789,
                }
            },
            // YOUTUBE: {
            //   tokens: {
            //     cookies: "VISITOR_INFO1_LIVE=ZUWs-NLdWwQ; CONSENT=YES+US.en+201912; NID=220=Ph1FCQAiOWWUvSHHVWJVwM9pSBY04jALTcuyHhm2AaXHBoWWCi-kR9k5gQB0qPZNqtKy0_EE6WPjlU_0zxngtuOoG2emMNipbeb3ecH1elc4LQICWThSHxlK6x8_hJFHm--ny3--amOWCDAlx_CvX3XlIqziCyW4xTJL65AJVPM; PREF=f6=80&tz=America.Los_Angeles&al=en&f5=30000; LOGIN_INFO=AFmmF2swRQIgaRnHZSyWnER6XkLJqTMqxoevP50j2h6sEBtghse3YGwCIQCs11HCPlwuvH7_qbk5nT65Q-rUwlqjlyVfd2PfJucedg:QUQ3MjNmeUdqeF96NjdaRHp5Q1N5UEVPeFc0OGR4RnExS1dWclBwSDRaZFB5UVBnRElRcVhydXJHQ0lEWkpfOUkyVS11M2Q3V2NpYi13ekEyXzJGS0ZoRVA3MktXZlVjU0tjT1ktUC1xNDRVZ1FRUWtyQnc2RFdBb1ZqWENEOGsyajZ1WnE4S2g3NHRMMXYtSEo3YmM1SjFpRV9qb0V0OXJB; YSC=5KgzbKp09KQ; SID=BgjQnMCdg09ZVGbZgCLLhaaVcKX8CxDGe7D9P3P2pmZCY9DPcjG3qjB9POHd6odOiD3OOQ.; __Secure-1PSID=BgjQnMCdg09ZVGbZgCLLhaaVcKX8CxDGe7D9P3P2pmZCY9DPcePw2ZvN0PeTD_3H0hSI0A.; __Secure-3PSID=BgjQnMCdg09ZVGbZgCLLhaaVcKX8CxDGe7D9P3P2pmZCY9DPfBG7ArRsT1y__BbxoAhweg.; HSID=AXqswZXERx5MMG82T; SSID=AUdamZO0U7NHythYb; APISID=9CK9ISJabveFv6Ut/AO45SCrXmy0ZE8CT4; SAPISID=LIG4OWrC86w7ZJ0j/AFHFbNtifEQnLMBoE; __Secure-1PAPISID=LIG4OWrC86w7ZJ0j/AFHFbNtifEQnLMBoE; __Secure-3PAPISID=LIG4OWrC86w7ZJ0j/AFHFbNtifEQnLMBoE; SIDCC=AJi4QfHKTuPiiYpTHD7cAhZlTR8r7pi6ErjFrPGHGze6TqnelAlzayqawECCFhopu5XTJdzh2A; __Secure-3PSIDCC=AJi4QfED1ECrAlveCXpMFJujbJIjVKrv6vXR3fmIOgv3sQDTQQNE7_Gy2bCtr77qc1BmtGGmtlw;",
            //     expiresAt: 1630383042789,
            //   }
            // },
            NETFLIX: {
                tokens: { accessToken: { userName: "chad@chadistheman.com", password: "YSTRAYENT" }, expiresAt: 1630383042789 }
            }
        }
    };
};

const EMYW_PROXY_API_KEY = "e1d060d6-fa29-11eb-9a03-0242ac130003";

const buildEMYWMeta = (provider, drmSessionId) => {
    if (!state.providers[provider]) state.providers[provider] = initState(true).providers[provider];
    const metaData = {
        apiKey: EMYW_PROXY_API_KEY,
        provider,
        enjoyDeviceId: localStorage.getItem('emwy-deviceid'),
        tokens: state.providers[provider].tokens,
        licenseUrl: state.providers[provider].licenseUrl,
        drmSessionId
    };
    return metaData;
};

const initPlayer = async () => {
    // Create a Player instance.
    const video = document.getElementById('video');
    const player = new shaka.Player(video);

    // Attach player to the window to make it easy to access in the JS console.
    window.player = player;

    // Listen for error events.
    player.addEventListener('error', onErrorEvent);

    // set some player defaults
    player.configure({
        preferredAudioLanguage: 'en',
    });

    // We send the emyw-meta to the proxy server for processing
    player.getNetworkingEngine().registerRequestFilter((type, request) => {
        // RequestType = {
        //   'MANIFEST': 0,
        //   'SEGMENT': 1,
        //   'LICENSE': 2,
        //   'APP': 3,
        //   'TIMING': 4,
        //   'SERVER_CERTIFICATE': 5,
        // };

        // Only add headers to license requests:
        // console.log('there is a request type', type);
        // if (type == shaka.net.NetworkingEngine.RequestType.MANIFEST) {
        //   console.log('there was a manifest request', request.uris);
        // } else
        if (type == shaka.net.NetworkingEngine.RequestType.SEGMENT) {
            // Note that once there were some CORS errors that were cached. Disabling cache in the network tab of devtools resolve it.
            // Consider adding a no-cache header here, but would prefer to do it only if we detect we are in retry.
            // console.log('there was a segment request', request);
        } else if (type == shaka.net.NetworkingEngine.RequestType.LICENSE) {
            const emywMeta = buildEMYWMeta(state.currentProvider, request.sessionId);
            emywMeta.videoId = state.currentVideoId;
            request.headers = Object.assign(request.headers, buildEMYWHeader(emywMeta));
        }
    });
}

const onErrorEvent = (event) => {
    // Extract the shaka.util.Error object from the event.
    onError(event.detail);
}

const onError = (error) => {
    // Log the error.
    console.error('Error code', error.code, 'object', error);
}

document.addEventListener('DOMContentLoaded', initApp);

const buildEMYWHeader = (emywMetaJson) => {
    const emywMeta = caesarEncode(btoa(JSON.stringify(emywMetaJson)))
    console.log((new TextEncoder().encode(emywMeta)).length);
    const headers = { 'emyw-meta': emywMeta };
    return headers;
}

// const updateAuthSession = async (provider) => {
//   const resAuth = await fetch(sessionPath, { method: 'POST', headers: buildEMYWHeader(buildEMYWMeta(state.currentProvider)) });
//   const bodyText = await resAuth.text();
//   state.providers[provider].tokens = JSON.parse(atob(caesarDecode(bodyText)));
//   localStorage.setItem('test-shaka-state', JSON.stringify(state));
//   console.log(state);
// };

const requestManifest = async (provider, videoId) => {
    const emywMeta = buildEMYWMeta(provider);
    emywMeta.videoId = videoId;
    const resManifest = await fetch(manifestPath, { method: 'POST', headers: buildEMYWHeader(emywMeta) });
    const bodyText = await resManifest.text();
    const manifestObject = JSON.parse(atob(caesarDecode(bodyText)));
    console.log(manifestObject);
    return manifestObject;
};

const handlePlay = async (provider, videoId) => {
    console.log('Play event');
    // Try to load a manifest.
    try {
        state.currentProvider = provider;
        state.currentVideoId = videoId;
        // Tell the proxy server to prepare the manifest
        const enjoyManifestObject = await requestManifest(provider, videoId);
        if (enjoyManifestObject.failMessage) throw new Error(enjoyManifestObject.failMessage);
        const manifestUrl = `${manifestPath}/${enjoyManifestObject.manifestUrlKey}`;
        state.providers[provider].tokens = enjoyManifestObject.tokens; // update incase they were refreshed
        state.providers[provider].licenseUrl = enjoyManifestObject.licenseUrl;

        const NETFLIX_SERVER_CERT = "Cr0CCAMSEOVEukALwQ8307Y2+LVP+0MYh/HPkwUijgIwggEKAoIBAQDm875btoWUbGqQD8eAGuBlGY+Pxo8YF1LQR+Ex0pDONMet8EHslcZRBKNQ/09RZFTP0vrYimyYiBmk9GG+S0wB3CRITgweNE15cD33MQYyS3zpBd4z+sCJam2+jj1ZA4uijE2dxGC+gRBRnw9WoPyw7D8RuhGSJ95OEtzg3Ho+mEsxuE5xg9LM4+Zuro/9msz2bFgJUjQUVHo5j+k4qLWu4ObugFmc9DLIAohL58UR5k0XnvizulOHbMMxdzna9lwTw/4SALadEV/CZXBmswUtBgATDKNqjXwokohncpdsWSauH6vfS6FXwizQoZJ9TdjSGC60rUB2t+aYDm74cIuxAgMBAAE6EHRlc3QubmV0ZmxpeC5jb20SgAOE0y8yWw2Win6M2/bw7+aqVuQPwzS/YG5ySYvwCGQd0Dltr3hpik98WijUODUr6PxMn1ZYXOLo3eED6xYGM7Riza8XskRdCfF8xjj7L7/THPbixyn4mULsttSmWFhexzXnSeKqQHuoKmerqu0nu39iW3pcxDV/K7E6aaSr5ID0SCi7KRcL9BCUCz1g9c43sNj46BhMCWJSm0mx1XFDcoKZWhpj5FAgU4Q4e6f+S8eX39nf6D6SJRb4ap7Znzn7preIvmS93xWjm75I6UBVQGo6pn4qWNCgLYlGGCQCUm5tg566j+/g5jvYZkTJvbiZFwtjMW5njbSRwB3W4CrKoyxw4qsJNSaZRTKAvSjTKdqVDXV/U5HK7SaBA6iJ981/aforXbd2vZlRXO/2S+Maa2mHULzsD+S5l4/YGpSt7PnkCe25F+nAovtl/ogZgjMeEdFyd/9YMYjOS4krYmwp3yJ7m9ZzYCQ6I8RQN4x/yLlHG5RH/+WNLNUs6JAZ0fFdCmw=";

        player.configure({
            drm: {
                servers: {
                    'com.widevine.alpha': `${licensePath}/${enjoyManifestObject.manifestUrlKey}`,
                    'com.microsoft.playready': `${licensePath}/${enjoyManifestObject.manifestUrlKey}`,
                }
            },
            streaming: {
                stallEnabled: false
            }
        });
        if (provider === "NETFLIX") {
            player.configure({
                drm: {
                    advanced: {
                        'com.widevine.alpha': {
                            serverCertificate: Uint8Array.from(window.atob(NETFLIX_SERVER_CERT), c => c.charCodeAt(0))
                        }
                    },
                },
                // streaming: {
                //   // Netflix video stalls/freezes a lot for some reason. Not sure if we should just enable this for all
                //   // actually, the real issue was described here noticed on Chrome only: https://github.com/google/shaka-player/issues/438
                //   stallEnabled: true 
                // }
            });
        }

        // Originally I had the response sending the manifest text in the requestManfiest response object.
        // But Roku needs an actual url that returns the manifest string, not an object with the manifest somewhere in it.
        // So we now make a call to prepare the manifest and other stuff like the licenseUrl and vmapXml. The manifest will remain in cache
        // for enough time for the client to then make another immediate request to pull down the manifest itself.

        // These lines were for if we have the manifest text now as opposed to a url to load
        // const mimeType = enjoyManifestObject.fixedManifest.indexOf('#EXTM3U') > -1 ? 'x-mpegurl' : 'dash+xml'
        // await player.load(`data:application/${mimeType};base64,${btoa(enjoyManifestObject.fixedManifest)}`);

        const manifestRes = await fetch(manifestUrl, { method: 'GET' });
        const manifest = await manifestRes.text();
        console.log(manifest);

        await player.load(manifestUrl);
        // This runs if the asynchronous load is successful.
        console.log('The video has now been loaded!');
    } catch (e) {
        // onError is executed if the asynchronous load fails.
        onError(e);
    }

}
